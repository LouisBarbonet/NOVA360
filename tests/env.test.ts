// Le .env est relu à chaque appel : une variable retirée du fichier doit cesser d'agir.
import { existsSync, readFileSync, writeFileSync, unlinkSync, renameSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";
import { refreshEnv } from "../server/llm";

const backup = ".env.test-backup";
beforeAll(() => existsSync(".env") && renameSync(".env", backup));
afterAll(() => {
  if (existsSync(".env")) unlinkSync(".env");
  if (existsSync(backup)) renameSync(backup, ".env");
});

it("retire une variable supprimée du .env et applique les nouvelles valeurs", () => {
  writeFileSync(".env", "NOVA_PROVIDER=gemini\nGEMINI_IMPACT_FALLBACK_MODELS=modele-de-test\n");
  refreshEnv();
  expect(process.env.GEMINI_IMPACT_FALLBACK_MODELS).toBe("modele-de-test");
  writeFileSync(".env", "NOVA_PROVIDER=gemini\n");
  refreshEnv();
  expect(process.env.GEMINI_IMPACT_FALLBACK_MODELS).toBeUndefined();
  expect(process.env.NOVA_PROVIDER).toBe("gemini");
});
