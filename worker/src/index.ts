// Relais Cloudflare Worker du chat NOVA 360 pour la version publiée (GitHub Pages).
// - La clé Gemini reste un secret Cloudflare : elle n'est jamais envoyée au navigateur.
// - Le relais construit lui-même la consigne à partir du corpus embarqué : il ne sert qu'à interroger NOVA.
// - Protections du quota : origines autorisées, limite par adresse IP, plafond quotidien, cache des réponses.
import data from "./data.generated.json";
import { RULES, alternate, chatTurns, knowledge, memoryText, normalize, type ChatTurn } from "../../server/prompt";

interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  GEMINI_FALLBACK_MODEL?: string;
  ALLOWED_ORIGINS: string;
  DAILY_LIMIT?: string;
  NOVA_KV: KVNamespace;
  PER_IP: { limit(opts: { key: string }): Promise<{ success: boolean }> };
}

const VERSIONS = ["baseline", ...data.updates.map((u: { version: string }) => u.version)];
const MAX_QUESTION = 800;
const MAX_TURNS = 10;

const json = (body: unknown, status: number, cors: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors } });

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function validate(body: unknown): { version: string; messages: ChatTurn[] } | string {
  const b = body as { version?: unknown; messages?: unknown };
  const version = typeof b?.version === "string" ? b.version : "baseline";
  if (!VERSIONS.includes(version)) return "Version inconnue.";
  if (!Array.isArray(b?.messages) || b.messages.length === 0 || b.messages.length > MAX_TURNS) return "Conversation invalide.";
  const messages: ChatTurn[] = [];
  for (const m of b.messages as { role?: unknown; content?: unknown }[]) {
    if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return "Message invalide.";
    if (m.role === "user" && m.content.length > MAX_QUESTION) return `Question trop longue (${MAX_QUESTION} caractères au maximum).`;
    messages.push({ role: m.role, content: m.content.slice(0, 6000) });
  }
  if (messages[messages.length - 1].role !== "user") return "Le dernier message doit être une question.";
  return { version, messages };
}

class GeminiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function callGemini(env: Env, model: string, system: string, turns: ChatTurn[]): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
      generationConfig: { maxOutputTokens: 2000 },
    }),
  });
  if (!res.ok) throw new GeminiError(`Gemini ${res.status}`, res.status);
  const out = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = out.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text) throw new GeminiError("Réponse vide", 502);
  return text;
}

/** Nouvelles tentatives si Gemini est surchargé, puis bascule sur le modèle de repli. */
async function answer(env: Env, system: string, turns: ChatTurn[]): Promise<{ text: string; model: string }> {
  const primary = env.GEMINI_MODEL || "gemini-flash-lite-latest";
  const fallback = env.GEMINI_FALLBACK_MODEL || "gemini-flash-latest";
  const attempts = [primary, primary, fallback];
  for (let i = 0; ; i++) {
    try {
      return { text: await callGemini(env, attempts[i], system, turns), model: attempts[i] };
    } catch (e) {
      const overloaded = e instanceof GeminiError && (e.status === 503 || e.status === 500);
      if (!overloaded || i === attempts.length - 1) throw e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";
    const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
    const cors: Record<string, string> = allowed.includes(origin)
      ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" }
      : {};

    if (request.method === "OPTIONS") return new Response(null, { status: allowed.includes(origin) ? 204 : 403, headers: cors });
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, versions: VERSIONS }, 200, cors);
    if (url.pathname !== "/api/chat" || request.method !== "POST") return json({ error: "Route inconnue." }, 404, cors);
    if (!allowed.includes(origin)) return json({ error: "Origine non autorisée." }, 403, cors);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Requête invalide." }, 400, cors);
    }
    const parsed = validate(body);
    if (typeof parsed === "string") return json({ error: parsed }, 400, cors);

    const turns = alternate(chatTurns(parsed.messages, parsed.version));
    const system = `${RULES}\n\n${knowledge(memoryText(data.baselineText, data.updates, parsed.version), data.corpusText)}`;
    const model = env.GEMINI_MODEL || "gemini-flash-lite-latest";
    const key = `answer:${await sha256(JSON.stringify({ model, system: await sha256(system), turns: turns.map((t) => [t.role, normalize(t.content)]) }))}`;

    // 1. Cache : une question déjà posée ne consomme ni quota ni limite
    const hit = await env.NOVA_KV.get<{ text: string; model: string }>(key, "json");
    if (hit) return json({ answer: hit.text, model: hit.model, provider: "gemini", cached: true }, 200, cors);

    // 2. Limite par adresse IP (fenêtre glissante d'une minute)
    const ip = request.headers.get("CF-Connecting-IP") ?? "inconnue";
    if (!(await env.PER_IP.limit({ key: ip })).success) {
      return json({ error: "Trop de questions en peu de temps : réessayez dans une minute." }, 429, cors);
    }

    // 3. Plafond quotidien global (protège le quota gratuit de Gemini)
    const day = `count:${new Date().toISOString().slice(0, 10)}`;
    const used = Number((await env.NOVA_KV.get(day)) ?? "0");
    if (used >= Number(env.DAILY_LIMIT ?? "150")) {
      return json({ error: "Plafond quotidien de questions libres atteint. Les questions d'exemple restent disponibles (réponses pré-enregistrées)." }, 429, cors);
    }
    await env.NOVA_KV.put(day, String(used + 1), { expirationTtl: 60 * 60 * 48 });

    try {
      const out = await answer(env, system, turns);
      await env.NOVA_KV.put(key, JSON.stringify(out), { expirationTtl: 60 * 60 * 24 * 30 });
      return json({ answer: out.text, model: out.model, provider: "gemini", cached: false }, 200, cors);
    } catch (e) {
      const status = e instanceof GeminiError ? e.status : 500;
      const message =
        status === 429
          ? "Quota gratuit Gemini atteint pour le moment. Les questions d'exemple restent disponibles (réponses pré-enregistrées)."
          : status === 503 || status === 500
            ? "Gemini est surchargé en ce moment : réessayez dans une minute."
            : "Le service de réponse est indisponible.";
      return json({ error: message }, status === 429 ? 429 : 503, cors);
    }
  },
};
