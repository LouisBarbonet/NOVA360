// Appel LLM indépendant du fournisseur : Claude par défaut, Gemini (palier gratuit) en secours.
// Choix par .env : NOVA_PROVIDER=claude|gemini (défaut claude).
import Anthropic from "@anthropic-ai/sdk";
import { ApiError, GoogleGenAI } from "@google/genai";
import { existsSync, readFileSync } from "node:fs";
import { cacheKey, readCache, writeCache } from "./cache";
import { alternate } from "./prompt";

export type Turn = { role: "user" | "assistant"; content: string };
type Purpose = "chat" | "impact";
export type Completion = { text: string; provider: string; model: string; cached?: boolean };

const httpError = (message: string, status: number) => Object.assign(new Error(message), { status });

/** Relit .env à chaque appel : changer de modèle ou de fournisseur ne demande pas de redémarrer le serveur. */
// (loadEnv de Vite ne convient pas ici : il donne priorité aux valeurs déjà en mémoire, donc aux anciennes)
function refreshEnv() {
  for (const file of [".env", ".env.local"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
    }
  }
}

export const provider = () => ((process.env.NOVA_PROVIDER || "claude").toLowerCase() === "gemini" ? "gemini" : "claude");

function modelFor(purpose: Purpose): string {
  if (provider() === "gemini") {
    const chat = process.env.GEMINI_MODEL || "gemini-flash-latest";
    return purpose === "impact" ? process.env.GEMINI_IMPACT_MODEL || chat : chat;
  }
  const chat = process.env.NOVA_MODEL || "claude-haiku-4-5";
  return purpose === "impact" ? process.env.NOVA_IMPACT_MODEL || chat : chat;
}

/** Échoue avant tout effet de bord si la clé du fournisseur choisi manque. */
export function assertConfigured() {
  refreshEnv();
  if (provider() === "gemini") {
    if (!process.env.GEMINI_API_KEY) throw httpError("Aucune clé Gemini : définissez GEMINI_API_KEY dans le fichier .env (ou NOVA_PROVIDER=claude).", 503);
  } else if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    throw httpError("Aucune clé API : définissez ANTHROPIC_API_KEY dans le fichier .env (ou NOVA_PROVIDER=gemini avec GEMINI_API_KEY).", 503);
  }
}

/**
 * @param rules consignes courtes
 * @param knowledge bloc volumineux et stable (mémoire + corpus), mis en cache côté Claude
 */
export async function complete(opts: {
  purpose: Purpose;
  rules: string;
  knowledge: string;
  turns: Turn[];
  maxTokens: number;
  json?: boolean;
  /** Réutilise une réponse identique déjà obtenue (même mémoire, même modèle, même conversation). */
  cache?: boolean;
}): Promise<Completion> {
  assertConfigured();
  const model = modelFor(opts.purpose);
  const turns = alternate(opts.turns);
  const key = opts.cache
    ? cacheKey({ provider: provider(), model, purpose: opts.purpose, rules: opts.rules, knowledge: opts.knowledge, turns, maxTokens: opts.maxTokens, json: opts.json })
    : "";
  if (key) {
    const hit = readCache<Completion>(key);
    if (hit) return { ...hit, cached: true };
  }
  const out = provider() === "gemini" ? await gemini(model, opts, turns) : await claude(model, opts, turns);
  // Seules les réponses réussies sont mises en cache (jamais une erreur de quota ou de surcharge)
  if (key) writeCache(key, out, turns[turns.length - 1]?.content ?? "");
  return out;
}

async function claude(model: string, opts: { rules: string; knowledge: string; maxTokens: number }, turns: Turn[]): Promise<Completion> {
  const msg = await new Anthropic().messages.create({
    model,
    max_tokens: opts.maxTokens,
    system: [
      { type: "text", text: opts.rules },
      // Bloc stable et volumineux mis en cache : chaque question suivante le relit à ~10 % du prix
      { type: "text", text: opts.knowledge, cache_control: { type: "ephemeral" } },
    ],
    messages: turns,
  });
  if (msg.stop_reason === "refusal") throw httpError("Le modèle a refusé de répondre.", 502);
  return { text: msg.content.map((b) => (b.type === "text" ? b.text : "")).join(""), provider: "claude", model: msg.model };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// Surcharge temporaire côté Google (503/500) : on réessaie, puis on bascule sur un modèle de repli
const isOverloaded = (e: unknown) => e instanceof ApiError && (e.status === 503 || e.status === 500);

async function gemini(model: string, opts: { rules: string; knowledge: string; maxTokens: number; json?: boolean }, turns: Turn[]): Promise<Completion> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const fallback = process.env.GEMINI_FALLBACK_MODEL || "gemini-flash-lite-latest";
  const attempts = [model, model, model, ...(fallback !== model ? [fallback] : [])];
  try {
    for (let i = 0; ; i++) {
      const current = attempts[i];
      try {
        const res = await ai.models.generateContent({
          model: current,
          contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
          config: {
            systemInstruction: `${opts.rules}\n\n${opts.knowledge}`,
            maxOutputTokens: opts.maxTokens,
            // Mode JSON natif de Gemini : sortie garantie syntaxiquement valide
            ...(opts.json ? { responseMimeType: "application/json" } : {}),
          },
        });
        const text = res.text;
        if (!text) throw httpError(`Gemini n'a renvoyé aucun texte (motif : ${res.candidates?.[0]?.finishReason ?? "inconnu"}).`, 502);
        return { text, provider: "gemini", model: current };
      } catch (e) {
        if (!isOverloaded(e) || i === attempts.length - 1) throw e;
        await sleep(2000 * (i + 1));
      }
    }
  } catch (e) {
    if (isOverloaded(e)) {
      throw httpError(`Gemini est surchargé en ce moment (${model} puis ${fallback}). Réessayez dans une minute, ou passez NOVA_PROVIDER=claude dans .env.`, 503);
    }
    if (e instanceof ApiError && e.status === 429) {
      throw httpError("Quota gratuit Gemini atteint (requêtes par minute ou par jour). Réessayez plus tard, ou passez NOVA_PROVIDER=claude dans .env.", 429);
    }
    if (e instanceof ApiError && (e.status === 401 || e.status === 403 || /API key not valid/i.test(e.message))) {
      throw httpError("Clé Gemini refusée : vérifiez GEMINI_API_KEY dans .env (clé créée sur aistudio.google.com).", 401);
    }
    if (e instanceof ApiError && e.status === 404) {
      throw httpError(`Modèle Gemini introuvable : « ${model} ». Listez les modèles disponibles avec npm run gemini:models, puis réglez GEMINI_MODEL dans .env.`, 400);
    }
    throw e;
  }
}
