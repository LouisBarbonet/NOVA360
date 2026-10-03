// Vérifie que chaque citation {s, r} de la mémoire pointe vers un passage existant du corpus.
// Usage : npm run validate [-- chemin/vers/memoire.json ...]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

type Seg = { ref: string; text: string };
type Src = { id: string; ext: string; segments: Seg[] };
type Cite = { s: string; r: string };

const corpus: { sources: Src[] } = JSON.parse(readFileSync("data/corpus.json", "utf8"));
const byId = new Map(corpus.sources.map((s) => [s.id, s]));

export function resolveRef(src: Src, ref: string): boolean {
  if (ref === "capture") return src.ext === ".png" && src.segments.length > 0;
  const range = ref.match(/^L(\d+)(?:-L(\d+))?$/);
  if (range) {
    const has = (n: string) => src.segments.some((g) => g.ref === `L${n}`);
    return has(range[1]) && (!range[2] || has(range[2]));
  }
  // Cellule Excel : « Feuille!E7 » → la ligne 7 de la feuille contient « E7= »
  // Plage de cellules : « Risques!F2-H2 » → au moins une ligne de la plage existe
  const span = ref.match(/^(.+)!([A-Z]+)(\d+)-([A-Z]+)?(\d+)$/);
  if (span) {
    return src.segments.some((g) => {
      const row = g.ref.match(/^(.+)!ligne (\d+)$/);
      return !!row && row[1] === span[1] && Number(row[2]) >= Number(span[3]) && Number(row[2]) <= Number(span[5]);
    });
  }
  const cell = ref.match(/^(.+)!([A-Z]+)(\d+)$/);
  if (cell) {
    return src.segments.some((g) => g.ref === `${cell[1]}!ligne ${cell[3]}` && g.text.includes(`${cell[2]}${cell[3]}=`));
  }
  return src.segments.some((g) => g.ref === ref);
}

function collect(node: unknown, path: string, out: { cite: Cite; path: string }[]) {
  if (Array.isArray(node)) node.forEach((n, i) => collect(n, `${path}[${i}]`, out));
  else if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (typeof o.s === "string" && typeof o.r === "string") out.push({ cite: o as unknown as Cite, path });
    for (const [k, v] of Object.entries(o)) collect(v, `${path}.${k}`, out);
  }
}

const dir = "data/memory";
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [join(dir, "baseline.json"), ...(existsSync(join(dir, "updates")) ? readdirSync(join(dir, "updates")).filter((f) => f.endsWith(".json")).map((f) => join(dir, "updates", f)) : [])];

let errors = 0;
for (const file of files) {
  const mem = JSON.parse(readFileSync(file, "utf8"));
  const cites: { cite: Cite; path: string }[] = [];
  collect(mem, "$", cites);
  for (const { cite, path } of cites) {
    const src = byId.get(cite.s);
    if (!src) {
      console.error(`✗ ${file} ${path} : source inconnue « ${cite.s} »`);
      errors++;
    } else if (!resolveRef(src, cite.r)) {
      console.error(`✗ ${file} ${path} : repère introuvable « ${cite.s} / ${cite.r} »`);
      errors++;
    }
  }
  // Les conditions de go-live doivent pointer vers des actions existantes
  const actionIds = new Set((mem.actions ?? []).map((a: { id: string }) => a.id));
  for (const gl of mem.goLiveConditions ?? []) {
    for (const a of gl.actions ?? []) if (!actionIds.has(a)) { console.error(`✗ ${file} ${gl.id} → action inconnue ${a}`); errors++; }
  }
  console.log(`${file} : ${cites.length} citations vérifiées`);
}
if (errors) {
  console.error(`${errors} erreur(s)`);
  process.exit(1);
}
console.log("✓ Toutes les citations résolvent vers le corpus.");
