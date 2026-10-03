// Cache disque des réponses LLM : une question identique (même mémoire, même corpus, même modèle) ne consomme plus de quota.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = ".cache/llm";

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

/** Normalise une question, ligne par ligne : casse, espaces et ponctuation finale n'empêchent pas la correspondance. */
export const normalize = (s: string) =>
  s
    .normalize("NFC")
    .toLowerCase()
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").replace(/[\s?!.…]+$/u, "").trim())
    .filter(Boolean)
    .join("\n");

/** Clé stable ; le contenu volumineux (mémoire + corpus) n'entre que par son empreinte. */
export function cacheKey(parts: { provider: string; model: string; purpose: string; rules: string; knowledge: string; turns: { role: string; content: string }[]; maxTokens: number; json?: boolean }): string {
  return sha(
    JSON.stringify({
      ...parts,
      rules: sha(parts.rules),
      knowledge: sha(parts.knowledge),
      turns: parts.turns.map((t) => ({ role: t.role, content: normalize(t.content) })),
    }),
  );
}

export function readCache<T>(key: string): T | undefined {
  const file = join(DIR, `${key}.json`);
  if (!existsSync(file)) return undefined;
  try {
    return (JSON.parse(readFileSync(file, "utf8")) as { value: T }).value;
  } catch {
    return undefined; // entrée corrompue : ignorée, elle sera réécrite
  }
}

export function writeCache(key: string, value: unknown, question: string) {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(join(DIR, `${key}.json`), JSON.stringify({ savedAt: new Date().toISOString(), question, value }, null, 1), "utf8");
}
