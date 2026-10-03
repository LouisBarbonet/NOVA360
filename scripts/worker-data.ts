// Prépare le contexte embarqué dans le relais Cloudflare : mémoire (baseline + mises à jour) et corpus, déjà mis en texte.
// Usage : npm run worker:data (lancé automatiquement par worker:deploy)
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { corpusText } from "../server/prompt";

const dir = "data/memory/updates";
const updates = existsSync(dir)
  ? readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")))
      .sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }))
  : [];

const out = {
  baselineText: readFileSync("data/memory/baseline.json", "utf8"),
  updates,
  corpusText: corpusText(JSON.parse(readFileSync("data/corpus.json", "utf8"))),
};
writeFileSync("worker/src/data.generated.json", JSON.stringify(out));
console.log(`✓ worker/src/data.generated.json : versions baseline${updates.map((u) => `, ${u.version}`).join("")} ; ${(JSON.stringify(out).length / 1024).toFixed(0)} Ko`);
