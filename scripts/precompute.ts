// Pré-enregistre les réponses du chat aux questions d'exemple et aux questions pièges, pour chaque version de la mémoire.
// Usage : npm run dev (dans un autre terminal), puis npm run precompute
// Passe par l'API locale : profite de son cache (une question déjà posée ne coûte aucun quota).
// Les réponses sont à RELIRE avant publication (data/precomputed/chat.json).
import { mkdirSync, readdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { EXAMPLE_QUESTIONS, TRAP_QUESTIONS } from "../src/questionList";

const API = process.env.NOVA_API ?? "http://localhost:5173/api/chat";
const dir = "data/memory/updates";
const versions = ["baseline", ...(existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")).version as string) : [])];

type Entry = { version: string; question: string; answer: string; model: string };
const entries: Entry[] = [];
let provider = "";
let failures = 0;

for (const version of versions) {
  for (const question of [...EXAMPLE_QUESTIONS, ...TRAP_QUESTIONS]) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version, messages: [{ role: "user", content: question }] }),
    }).catch(() => null);
    const data = res ? await res.json() : { error: `API locale injoignable (${API}) : lancez npm run dev` };
    if (!res?.ok) {
      console.error(`✗ [${version}] ${question} — ${data.error}`);
      failures++;
      if (!res) process.exit(1);
      continue;
    }
    provider = data.provider;
    entries.push({ version, question, answer: data.answer, model: data.model });
    console.log(`${data.cached ? "⚡" : "✓"} [${version}] ${question}`);
  }
}

mkdirSync("data/precomputed", { recursive: true });
writeFileSync("data/precomputed/chat.json", JSON.stringify({ generatedAt: new Date().toISOString(), provider, entries }, null, 2) + "\n");
console.log(`\n${entries.length} réponses écrites dans data/precomputed/chat.json${failures ? ` (${failures} échec(s) : relancez plus tard, le cache évite de repayer les autres)` : ""}`);
console.log("À relire avant publication : chaque réponse doit être juste et ses citations valides (npm test le vérifie).");
