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
// Une variable retirée de .env doit cesser d'agir : on gère toutes celles documentées dans .env.example
// et celles déjà lues depuis .env (sinon une ancienne valeur resterait active en mémoire).
const managedKeys = new Set<string>();
const parseEnvFile = (file: string) => {
  const out = new Map<string, string>();
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out.set(m[1], m[2].replace(/^(["'])(.*)\1$/, "$2"));
  }
  return out;
};

export function refreshEnv() {
  for (const k of parseEnvFile(".env.example").keys()) managedKeys.add(k);
  const current = new Map([...parseEnvFile(".env"), ...parseEnvFile(".env.local")]);
  for (const k of managedKeys) if (!current.has(k)) delete process.env[k];
  for (const [k, v] of current) {
    process.env[k] = v;
    managedKeys.add(k);
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
const isOverloaded = (e: unknown) => e instanceof ApiError && (e.status === 503 || e.status === 500);
const isQuota = (e: unknown) => e instanceof ApiError && e.status === 429;

/**
 * Échelle de modèles Gemini : le modèle demandé, puis des modèles de repli DISTINCTS.
 * Sur le palier gratuit, le quota (ex. 20 requêtes/jour) est compté par modèle : changer de modèle redonne du quota.
 * - surcharge (503/500) : 1 nouvelle tentative sur le même modèle, puis modèle suivant ;
 * - quota épuisé (429) : modèle suivant immédiatement.
 */
// Deux échelles distinctes : le chat (modèles « lite ») ne consomme jamais le quota réservé à l'analyse d'impact.
const DEFAULT_FALLBACKS: Record<Purpose, string> = {
  chat: "gemini-3.1-flash-lite",
  impact: "gemini-3.7-flash,gemini-3.6-flash,gemini-3.5-flash,gemini-3.1-flash-lite,gemini-flash-lite-latest",
};

function geminiLadder(model: string, purpose: Purpose): string[] {
  const configured = purpose === "impact" ? process.env.GEMINI_IMPACT_FALLBACK_MODELS : process.env.GEMINI_FALLBACK_MODELS || process.env.GEMINI_FALLBACK_MODEL;
  const fallbacks = (configured || DEFAULT_FALLBACKS[purpose])
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return [...new Set([model, ...fallbacks])];
}

async function withGemini<T>(model: string, purpose: Purpose, call: (m: string) => Promise<T>): Promise<{ value: T; model: string }> {
  const ladder = geminiLadder(model, purpose);
  let last: unknown;
  for (const m of ladder) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return { value: await call(m), model: m };
      } catch (e) {
        last = e;
        if (isOverloaded(e) && attempt === 0) {
          await sleep(2000);
          continue;
        }
        if (isOverloaded(e) || isQuota(e)) break; // modèle suivant
        // 404 : modèle introuvable sur ce compte → on essaie le suivant ; autre erreur → arrêt
        if (e instanceof ApiError && e.status === 404) break;
        throw geminiError(e, m);
      }
    }
  }
  throw geminiError(last, ladder.join(" → "));
}

function geminiError(e: unknown, models: string): Error {
  if (isQuota(e)) return httpError(`Quota gratuit Gemini épuisé pour tous les modèles essayés (${models}). Réessayez plus tard, ou passez NOVA_PROVIDER=claude dans .env.`, 429);
  if (isOverloaded(e)) return httpError(`Gemini est surchargé en ce moment (${models}). Réessayez dans une minute, ou passez NOVA_PROVIDER=claude dans .env.`, 503);
  if (e instanceof ApiError && (e.status === 401 || e.status === 403 || /API key not valid/i.test(e.message))) {
    return httpError("Clé Gemini refusée : vérifiez GEMINI_API_KEY dans .env (clé créée sur aistudio.google.com).", 401);
  }
  if (e instanceof ApiError && e.status === 404) {
    return httpError(`Modèle Gemini introuvable (${models}). Listez les modèles disponibles avec npm run gemini:models, puis réglez GEMINI_MODEL dans .env.`, 400);
  }
  return e instanceof Error ? e : new Error(String(e));
}

async function gemini(model: string, opts: { purpose: Purpose; rules: string; knowledge: string; maxTokens: number; json?: boolean }, turns: Turn[]): Promise<Completion> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const { value, model: used } = await withGemini(model, opts.purpose, async (m) => {
    const res = await ai.models.generateContent({
      model: m,
      contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
      config: {
        systemInstruction: `${opts.rules}\n\n${opts.knowledge}`,
        maxOutputTokens: opts.maxTokens,
        // Mode JSON natif de Gemini : sortie garantie syntaxiquement valide
        ...(opts.json ? { responseMimeType: "application/json" } : {}),
      },
    });
    if (!res.text) throw httpError(`Gemini n'a renvoyé aucun texte (motif : ${res.candidates?.[0]?.finishReason ?? "inconnu"}).`, 502);
    return res.text;
  });
  return { text: value, provider: "gemini", model: used };
}

const TRANSCRIBE_PROMPT = `Transcris fidèlement cette capture d'écran en français, comme preuve pour un dossier de projet.
Format : une information par ligne, dans l'ordre de lecture.
- Commence par « Bandeau : … » (titre de l'application, version, URL) et « Titre de page : … » s'ils existent.
- Recopie mot pour mot les textes, tableaux (une ligne par rangée, colonnes séparées par « | »), statuts et valeurs (OK, TODO, dates, montants).
- Décris brièvement les éléments visuels qui portent du sens (encadré rouge, texte barré, couleur d'un statut).
- N'interprète pas, ne résume pas, n'ajoute rien qui ne soit pas visible. Si un texte est illisible, écris [illisible].`;

/** Transcription d'une image (LLM vision) ; marquée « à relire » par l'appelant. */
export async function transcribeImage(data: Buffer, mimeType: "image/png" | "image/jpeg"): Promise<string> {
  assertConfigured();
  const model = modelFor("impact");
  if (provider() === "claude") {
    const msg = await new Anthropic().messages.create({
      model,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: data.toString("base64") } },
            { type: "text", text: TRANSCRIBE_PROMPT },
          ],
        },
      ],
    });
    return msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const { value } = await withGemini(model, "impact", async (m) => {
    const res = await ai.models.generateContent({
      model: m,
      contents: [{ role: "user", parts: [{ inlineData: { mimeType, data: data.toString("base64") } }, { text: TRANSCRIBE_PROMPT }] }],
      config: { maxOutputTokens: 2000 },
    });
    if (!res.text) throw httpError("Transcription vide.", 502);
    return res.text;
  });
  return value;
}
