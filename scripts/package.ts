// Construit le paquet de remise NOVA360_remise.zip (dist/, livrables/, MODE_EMPLOI.md, README.md).
// Usage : npm run package   (refait d'abord l'export : build + livrables)
// Zip en JavaScript pur (fflate) : chemins avec « / », lisible sous Windows, macOS et Linux.
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { zipSync, type Zippable } from "fflate";

const OUT = "NOVA360_remise.zip";
const ENTRIES = ["dist", "livrables", "MODE_EMPLOI.md", "README.md"];

function walk(p: string): string[] {
  return statSync(p).isDirectory() ? readdirSync(p).flatMap((n) => walk(join(p, n))) : [p];
}

const files: Zippable = {};
for (const entry of ENTRIES) {
  if (!existsSync(entry)) throw new Error(`Introuvable : ${entry} (lancez npm run export)`);
  for (const f of walk(entry)) files[relative(".", f).split(sep).join("/")] = readFileSync(f);
}
if (!files["dist/index.html"]) throw new Error("dist/index.html manquant");

// Garde-fou : aucune clé API du .env ne doit se retrouver dans le paquet
const keys = existsSync(".env")
  ? [...readFileSync(".env", "utf8").matchAll(/^(?:ANTHROPIC|GEMINI)_API_KEY=(.+)$/gm)].map((m) => m[1].trim()).filter(Boolean)
  : [];
for (const [name, data] of Object.entries(files)) {
  const text = Buffer.from(data as Uint8Array).toString("latin1");
  if (keys.some((k) => text.includes(k))) throw new Error(`Clé API détectée dans ${name} : paquet non créé.`);
}
const zip = zipSync(files, { level: 9 });
writeFileSync(OUT, zip);
const versions = Object.keys(files).filter((f) => /^livrables\/[^/]+\/1_BRIEF\.md$/.test(f)).map((f) => f.split("/")[1]);
console.log(`✓ ${OUT} : ${Object.keys(files).length} fichiers, ${(zip.length / 1024).toFixed(0)} Ko — versions : ${versions.join(", ")}`);
