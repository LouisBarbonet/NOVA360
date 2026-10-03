import { expect, it } from "vitest";
import { cacheKey, normalize } from "../server/cache";

const base = { provider: "gemini", model: "gemini-flash-lite-latest", purpose: "chat", rules: "R", knowledge: "MEMOIRE+CORPUS", maxTokens: 2000 };
const ask = (q: string, extra = {}) => cacheKey({ ...base, ...extra, turns: [{ role: "user", content: `${q}\n(Réponds selon l'état au 30 septembre.)` }] });

it("ignore casse, espaces et ponctuation finale", () => {
  expect(normalize("  Le 22 octobre   est-il GARANTI ?  ")).toBe("le 22 octobre est-il garanti");
  expect(ask("Le 22 octobre est-il garanti?")).toBe(ask("le 22 octobre  est-il garanti"));
});

it("distingue des questions différentes", () => {
  expect(ask("SEC-210 est-il fermé?")).not.toBe(ask("ACC-303 est-il fermé?"));
});

it("est invalidé quand la mémoire, le modèle ou le fournisseur change", () => {
  const k = ask("Q01?");
  expect(ask("Q01?", { knowledge: "MEMOIRE U1+CORPUS" })).not.toBe(k);
  expect(ask("Q01?", { model: "gemini-flash-latest" })).not.toBe(k);
  expect(ask("Q01?", { provider: "claude" })).not.toBe(k);
});
