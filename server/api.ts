// API locale servie par le serveur de dev Vite : chat, ingestion d'un nouvel événement, enregistrement d'une mise à jour.
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { assertConfigured, complete } from "./llm";

const CORPUS = "data/corpus.json";
const MEMORY = "data/memory";
const EVENT_DIR = "NOVA_ETUDIANTS/Projet360_NOVA_ETUDIANTS/09_Nouvel_evenement";

type Seg = { ref: string; text: string };
type Src = { id: string; path: string; folder: string; segments: Seg[]; attachments: { filename: string; duplicateOf?: string }[] };

const RULES = `Tu es la mémoire opérationnelle du projet NOVA (projet fictif). Tu réponds en français, de façon concise et nuancée.
Règles impératives :
- N'utilise QUE les faits du corpus et de la mémoire fournis. Si une information manque, dis-le explicitement (« non documenté »). N'invente ni décision, ni échéance, ni approbation.
- Cite chaque fait avec le marqueur [[ID:repère]] où ID est l'identifiant de source (ex. E05, M04, SEC-210, Plan_Projet_NOVA_v3_12sept) et repère est L<n> ou L<a>-L<b> (lignes), p.<n> (page PDF), Feuille!<cellule> (Excel, ex. Plan projet!E7) ou « capture » (image). Exemple : [[M04:L17-L23]]. Un seul repère par marqueur : pour deux preuves, écris [[SEC-210:L25]] [[M06:L7]] (jamais [[A:x], [B:y]] ni [[ACC-303:L6,L14]]).
- Distingue toujours proposition / décision / livraison / validation. Un correctif « livré » ou « déployé » n'est pas « accepté ». Une proposition n'est pas une décision.
- Une date de fichier récente ne garantit pas l'exactitude : tranche par l'autorité (comité, responsable désigné, ticket) et la date des faits.
- Les pièces jointes identiques à un fichier séparé et Courriel_archive_17sept (copie d'E12) ne sont pas des confirmations indépendantes. INV-778 concerne un autre projet. Les notes personnelles anonymes n'ont aucune autorité.
- Montants en CAD hors taxes ; distingue autorisé, facturé et payé.
- Quand tu proposes des actions, indique si c'est un engagement documenté (avec preuve) ou une recommandation.`;

function corpusText(): string {
  const corpus: { sources: Src[] } = JSON.parse(readFileSync(CORPUS, "utf8"));
  return corpus.sources
    .filter((s) => s.id !== "README" && s.id !== "MANIFEST")
    .map((s) => {
      const pj = s.attachments.length ? ` [pièces jointes : ${s.attachments.map((a) => `${a.filename}${a.duplicateOf ? ` = ${a.duplicateOf}` : ""}`).join(", ")}]` : "";
      return `##### ${s.id} (${s.path})${pj}\n${s.segments.filter((g) => g.text.trim()).map((g) => `${g.ref}\t${g.text}`).join("\n")}`;
    })
    .join("\n\n");
}

function updateFiles(): string[] {
  const dir = join(MEMORY, "updates");
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
}

function memoryText(version: string): string {
  const baseline = readFileSync(join(MEMORY, "baseline.json"), "utf8");
  let out = `=== MÉMOIRE BASELINE (état au 30 sept. 2026 09:00) ===\n${baseline}`;
  for (const f of updateFiles()) {
    const u = JSON.parse(readFileSync(join(MEMORY, "updates", f), "utf8"));
    out += `\n\n=== MISE À JOUR ${u.version} (${u.label}) — elle remplace les éléments du baseline de même id ===\n${JSON.stringify(u)}`;
    if (u.version === version) break;
  }
  return out;
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function chat(body: { version?: string; messages: { role: "user" | "assistant"; content: string }[] }) {
  const version = body.version ?? "baseline";
  const asOf =
    version === "baseline"
      ? "Réponds selon l'état au 30 septembre 2026 à 09:00 (baseline), sans tenir compte d'événements postérieurs."
      : `Réponds selon l'état après la mise à jour ${version} ; si c'est pertinent, signale ce qui a changé par rapport au baseline.`;
  const out = await complete({
    purpose: "chat",
    rules: RULES,
    knowledge: `${memoryText(version)}\n\n=== CORPUS COMPLET ===\n${corpusText()}`,
    // la consigne de date est fusionnée dans le dernier message utilisateur
    turns: [...body.messages.slice(-10), { role: "user", content: `(${asOf})` }],
    maxTokens: 2000,
    cache: true,
  });
  return { answer: out.text, provider: out.provider, model: out.model, cached: !!out.cached };
}

const IMPACT_SCHEMA = `{
  "version": "U<n>",
  "label": "U<n> — <titre court> (<date>)",
  "asOf": "<date ISO de l'événement>",
  "event": { "title": "...", "summary": "Ce que dit l'événement, en distinguant statut du problème / décision antérieure / nouvelle proposition", "sources": [{"s":"<ID>","r":"L1-L5"}] },
  "changes": [{ "what": "élément", "before": "état baseline", "after": "nouvel état", "sources": [...] }],
  "affected": [{ "ref": "Q01 | GL-1 | A-04 | C-02 | topic:date ...", "impact": "...", "sources": [...] }],
  "unchanged": [{ "ref": "GL-2 ...", "why": "pourquoi cela ne change pas (ex. aucune preuve de fermeture)", "sources": [...] }],
  "patch": {
    "topics": [ <objets topic COMPLETS du baseline, modifiés, même id> ],
    "goLiveConditions": [ ... ], "actions": [ <actions modifiées (même id) ou nouvelles (id A-14+), mêmes champs que le baseline> ],
    "answers": [ <réponses Q01–Q10 modifiées, objets complets> ], "risks": [ ... ], "missing": [ ... ], "decisions": [ ... ], "contradictions": [ ... ],
    "timeline": [ { "date": "YYYY-MM-DD", "type": "proposition|décision|livraison|validation|risque|fait", "topic": "<id de topic>", "title": "...", "sources": [...] } ]
  }
}`;

function newEventSources(): Src[] {
  const corpus: { sources: Src[] } = JSON.parse(readFileSync(CORPUS, "utf8"));
  const used = updateFiles().map((f) => readFileSync(join(MEMORY, "updates", f), "utf8")).join("\n");
  return corpus.sources.filter((s) => s.folder === "09_Nouvel_evenement" && !used.includes(`"s":"${s.id}"`) && !used.includes(`"s": "${s.id}"`));
}

async function ingestEvent(body: { title: string; text?: string }) {
  assertConfigured(); // échoue avant toute écriture si la clé manque
  if (body.text?.trim()) {
    mkdirSync(EVENT_DIR, { recursive: true });
    const slug = body.title.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 50);
    const n = existsSync(EVENT_DIR) ? readdirSync(EVENT_DIR).length + 1 : 1;
    writeFileSync(join(EVENT_DIR, `EVT-${String(n).padStart(2, "0")}_${slug}.txt`), body.text.trim() + "\n", "utf8");
  }
  execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/extract.ts"], { stdio: "pipe" });
  const fresh = newEventSources();
  if (!fresh.length) throw Object.assign(new Error("Aucune nouvelle source dans 09_Nouvel_evenement (collez un texte ou déposez un fichier, puis réessayez)."), { status: 400 });

  const nextVersion = `U${updateFiles().length + 1}`;
  const eventText = fresh.map((s) => `##### ${s.id} (${s.path})\n${s.segments.map((g) => `${g.ref}\t${g.text}`).join("\n")}`).join("\n\n");
  const out = await complete({
    purpose: "impact",
    rules: RULES,
    knowledge: `${memoryText("latest")}\n\n=== CORPUS COMPLET ===\n${corpusText()}`,
    maxTokens: 16000,
    json: true,
    turns: [
      {
        role: "user",
        content: `Un NOUVEL ÉVÉNEMENT vient d'arriver. Intègre-le à la mémoire SANS modifier le baseline : produis une mise à jour ${nextVersion}.

${eventText}

Analyse :
1. Qu'est-ce qui vient de changer? (avant/après, sourcé)
2. Quelles informations précédentes sont affectées? (réponses Q01–Q10, conditions GL-1..3, actions, risques, contradictions, sujets)
3. Quelles actions devraient être prises? (responsable, échéance connue ou « à confirmer », origine « engagement documenté » seulement si l'événement ou le corpus le prouve, sinon « recommandation équipe »)
Contraintes : distingue le statut du problème, la décision antérieure et la nouvelle proposition. N'invente AUCUNE approbation. Ne ferme AUCUNE autre condition de go-live sans preuve explicite et liste-les dans "unchanged".
"patch" ne contient QUE les éléments réellement modifiés ou nouveaux (objets complets, même id) : n'y recopie jamais un élément inchangé. Vérifie chaque comparaison de dates (avant/après, nombre de jours) avant de l'écrire. Chaque élément doit citer ses sources (la nouvelle source ${fresh.map((s) => s.id).join(", ")} et les sources du corpus).

Réponds UNIQUEMENT avec un objet JSON valide suivant ce schéma (sans texte autour) :
${IMPACT_SCHEMA}`,
      },
    ],
  });
  const raw = out.text;
  let draft: unknown;
  try {
    draft = pruneUnchanged(parseLenient(raw) as Record<string, unknown>);
  } catch {
    draft = { version: nextVersion, _erreur: "Le modèle n'a pas produit de JSON valide : corrigez à la main.", brut: raw };
  }
  return { sourceId: fresh.map((s) => s.id).join(", "), provider: out.provider, model: out.model, draft };
}

/** JSON du LLM : texte autour ignoré, puis réparation des fautes courantes (clé sans guillemets, virgule finale). */
export function parseLenient(raw: string): unknown {
  const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  try {
    return JSON.parse(json);
  } catch {
    const repaired = json
      .replace(/([{,]\s*)([A-Za-z_][\w-]*)\s*:/g, '$1"$2":')
      .replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(repaired);
  }
}

/** Retire du patch les éléments identiques au baseline : seuls les vrais changements seront signalés « modifié ». */
export function pruneUnchanged(draft: Record<string, unknown>): Record<string, unknown> {
  const baseline = JSON.parse(readFileSync(join(MEMORY, "baseline.json"), "utf8")) as Record<string, unknown>;
  const patch = (draft.patch ?? {}) as Record<string, unknown>;
  const same = (a: Record<string, unknown>, b: Record<string, unknown>) =>
    Object.keys(a).every((k) => k.startsWith("_") || JSON.stringify(a[k]) === JSON.stringify(b[k]));
  const pruned: string[] = [];
  for (const [key, items] of Object.entries(patch)) {
    const base = baseline[key];
    if (key === "timeline" || !Array.isArray(items) || !Array.isArray(base)) continue;
    patch[key] = items.filter((it: Record<string, unknown>) => {
      const k = it.id ?? it.title;
      const b = (base as Record<string, unknown>[]).find((x) => (x.id ?? x.title) === k);
      const unchanged = !!b && same(it, b);
      if (unchanged) pruned.push(String(k));
      return !unchanged;
    });
  }
  return { ...draft, patch, ...(pruned.length ? { _retiresCarInchanges: pruned } : {}) };
}

function saveUpdate(raw: string) {
  const u = JSON.parse(raw);
  for (const k of ["version", "label", "asOf", "event", "changes", "affected", "patch"]) {
    if (!(k in u)) throw Object.assign(new Error(`Champ requis manquant : ${k}`), { status: 400 });
  }
  if (u.version === "baseline") throw Object.assign(new Error("Le baseline ne peut pas être remplacé."), { status: 400 });
  mkdirSync(join(MEMORY, "updates"), { recursive: true });
  const file = join(MEMORY, "updates", `${u.version}.json`);
  writeFileSync(file, JSON.stringify(u, null, 2), "utf8");
  let validation = "";
  try {
    validation = execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/validate.ts", file], { encoding: "utf8" });
  } catch (e) {
    validation = String((e as { stdout?: string; stderr?: string }).stderr ?? e);
  }
  return { version: u.version, file, validation };
}

export function novaApi(): Plugin {
  return {
    name: "nova-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/") || req.method !== "POST") return next();
        try {
          const body = await readBody(req);
          if (req.url === "/api/chat") return send(res, 200, await chat(JSON.parse(body)));
          if (req.url === "/api/event") return send(res, 200, await ingestEvent(JSON.parse(body)));
          if (req.url === "/api/update") return send(res, 200, saveUpdate(body));
          return send(res, 404, { error: "Route inconnue" });
        } catch (e) {
          const err = e as Error & { status?: number };
          console.error(err);
          return send(res, err.status ?? 500, { error: err.message });
        }
      });
    },
  };
}
