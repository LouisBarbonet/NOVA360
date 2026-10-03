// Appel LLM indépendant du fournisseur : Claude par défaut, Gemini (palier gratuit) en secours.
// Choix par .env : NOVA_PROVIDER=claude|gemini (défaut claude).
import Anthropic from "@anthropic-ai/sdk";
import { ApiError, GoogleGenAI } from "@google/genai";

export type Turn = { role: "user" | "assistant"; content: string };
type Purpose = "chat" | "impact";
export type Completion = { text: string; provider: string; model: string };

const httpError = (message: string, status: number) => Object.assign(new Error(message), { status });

// Lus à l'appel : le .env est chargé par vite.config.ts après l'import de ce module
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
  if (provider() === "gemini") {
    if (!process.env.GEMINI_API_KEY) throw httpError("Aucune clé Gemini : définissez GEMINI_API_KEY dans le fichier .env (ou NOVA_PROVIDER=claude), puis relancez npm run dev.", 503);
  } else if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    throw httpError("Aucune clé API : définissez ANTHROPIC_API_KEY dans le fichier .env (ou NOVA_PROVIDER=gemini avec GEMINI_API_KEY), puis relancez npm run dev.", 503);
  }
}

/** Fusionne les tours consécutifs du même rôle (les deux API exigent l'alternance). */
function alternate(turns: Turn[]): Turn[] {
  return turns.reduce<Turn[]>((acc, t) => {
    const last = acc[acc.length - 1];
    if (last && last.role === t.role) last.content = `${last.content}\n${t.content}`;
    else acc.push({ ...t });
    return acc;
  }, []);
}

/**
 * @param rules consignes courtes
 * @param knowledge bloc volumineux et stable (mémoire + corpus), mis en cache côté Claude
 */
export async function complete(opts: { purpose: Purpose; rules: string; knowledge: string; turns: Turn[]; maxTokens: number }): Promise<Completion> {
  assertConfigured();
  const model = modelFor(opts.purpose);
  const turns = alternate(opts.turns);
  return provider() === "gemini" ? gemini(model, opts, turns) : claude(model, opts, turns);
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

async function gemini(model: string, opts: { rules: string; knowledge: string; maxTokens: number }, turns: Turn[]): Promise<Completion> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.generateContent({
      model,
      contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
      config: { systemInstruction: `${opts.rules}\n\n${opts.knowledge}`, maxOutputTokens: opts.maxTokens },
    });
    const text = res.text;
    if (!text) throw httpError(`Gemini n'a renvoyé aucun texte (motif : ${res.candidates?.[0]?.finishReason ?? "inconnu"}).`, 502);
    return { text, provider: "gemini", model };
  } catch (e) {
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
