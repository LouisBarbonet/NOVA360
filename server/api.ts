// API locale servie par le serveur de dev Vite : chat, ingestion d'un nouvel événement, enregistrement d'une mise à jour.
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { jsonrepair } from "jsonrepair";
import { assertConfigured, complete, transcribeImage } from "./llm";
import { RULES, chatTurns, corpusText as buildCorpusText, knowledge, memoryText as buildMemoryText } from "./prompt";

const CORPUS = "data/corpus.json";
const MEMORY = "data/memory";
const EVENT_DIR = "NOVA_ETUDIANTS/Projet360_NOVA_ETUDIANTS/09_Nouvel_evenement";

type Seg = { ref: string; text: string };
type Src = { id: string; path: string; folder: string; segments: Seg[]; attachments: { filename: string; duplicateOf?: string }[] };

const corpusText = () => buildCorpusText(JSON.parse(readFileSync(CORPUS, "utf8")));

function updateFiles(): string[] {
  const dir = join(MEMORY, "updates");
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
}

function memoryText(version: string): string {
  const updates = updateFiles().map((f) => JSON.parse(readFileSync(join(MEMORY, "updates", f), "utf8")));
  // « latest » : toutes les mises à jour (analyse d'un nouvel événement)
  const target = version === "latest" ? (updates.at(-1)?.version ?? "baseline") : version;
  return buildMemoryText(readFileSync(join(MEMORY, "baseline.json"), "utf8"), updates, target);
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
  const out = await complete({
    purpose: "chat",
    rules: RULES,
    knowledge: knowledge(memoryText(version), corpusText()),
    turns: chatTurns(body.messages, version),
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
    "timeline": [ { "date": "YYYY-MM-DD", "type": "proposition|décision|livraison|validation|risque|fait", "topic": "<id de topic>", "title": "...", "sources": [...] } ],
    "brief": { "title": "Brief de reprise — NOVA après <U<n>> (<date>)", "sections": [ <les 6 thèmes du brief du baseline, DANS LE MÊME ORDRE (Responsable, Date approuvée et conditions, Portée, Budget, Factures, Priorités) : recopie les thèmes inchangés, réécris ceux que l'événement modifie ; même longueur qu'au baseline (le brief doit tenir sur une page) ; chaque thème cite ses sources> ] }
  }
}`;

function newEventSources(): Src[] {
  const corpus: { sources: Src[] } = JSON.parse(readFileSync(CORPUS, "utf8"));
  const used = updateFiles().map((f) => readFileSync(join(MEMORY, "updates", f), "utf8")).join("\n");
  return corpus.sources.filter((s) => s.folder === "09_Nouvel_evenement" && !used.includes(`"s":"${s.id}"`) && !used.includes(`"s": "${s.id}"`));
}

const runExtract = () => execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/extract.ts"], { stdio: "pipe" });
const safeName = (name: string) => name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);

/** Fait transcrire par le LLM (vision) les images encore sans transcription, puis relance l'extraction. */
async function transcribePending(): Promise<string[]> {
  const corpus = JSON.parse(readFileSync(CORPUS, "utf8")) as { pendingTranscriptions?: { id: string; raw: string; sidecar: string }[] };
  const done: string[] = [];
  for (const p of corpus.pendingTranscriptions ?? []) {
    const mime = p.raw.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    const text = await transcribeImage(readFileSync(p.raw), mime);
    mkdirSync(dirname(p.sidecar), { recursive: true });
    writeFileSync(p.sidecar, `[Transcription automatique (LLM) — à relire]\n${text.trim()}\n`, "utf8");
    done.push(p.id);
  }
  if (done.length) runExtract();
  return done;
}

async function ingestEvent(body: { title: string; text?: string; files?: { name: string; data: string }[] }) {
  assertConfigured(); // échoue avant toute écriture si la clé manque
  mkdirSync(EVENT_DIR, { recursive: true });
  let n = readdirSync(EVENT_DIR).length;
  const prefix = () => `EVT-${String(++n).padStart(2, "0")}`;
  if (body.text?.trim()) {
    const slug = safeName(body.title || "evenement").replace(/\./g, "_").slice(0, 50);
    writeFileSync(join(EVENT_DIR, `${prefix()}_${slug}.txt`), body.text.trim() + "\n", "utf8");
  }
  // Fichiers téléversés depuis l'interface (n'importe quel format du corpus : eml, pdf, xlsx, png, txt, md, csv)
  for (const f of body.files ?? []) {
    writeFileSync(join(EVENT_DIR, `${prefix()}_${safeName(f.name)}`), Buffer.from(f.data, "base64"));
  }
  runExtract();
  // Plan B : une transcription impossible (quota, surcharge) ne bloque pas l'analyse ; l'image reste à transcrire à la main
  let transcribed: string[] = [];
  let transcriptionError = "";
  try {
    transcribed = await transcribePending();
  } catch (e) {
    transcriptionError = (e as Error).message;
  }
  const fresh = newEventSources();
  if (!fresh.length) throw Object.assign(new Error("Aucune nouvelle source dans 09_Nouvel_evenement (collez un texte ou ajoutez un fichier, puis réessayez)."), { status: 400 });

  const nextVersion = `U${updateFiles().length + 1}`;
  const eventText = fresh.map((s) => `##### ${s.id} (${s.path})\n${s.segments.map((g) => `${g.ref}\t${g.text}`).join("\n")}`).join("\n\n");
  const sourcesInfo = fresh.map((s) => ({ id: s.id, segments: s.segments.length }));
  // Plan B : si le LLM est indisponible, on garde les sources ingérées et on propose un brouillon vide à remplir à la main
  const skeleton = (reason: string) => ({
    version: nextVersion,
    label: `${nextVersion} — ${body.title || "nouvel événement"}`,
    asOf: new Date().toISOString().slice(0, 19),
    _erreur: `${reason} — complétez ce brouillon à la main (mêmes champs que ci-dessous), puis enregistrez.`,
    event: { title: body.title || "", summary: "", sources: fresh.map((s) => ({ s: s.id, r: s.segments[0]?.ref ?? "L1" })) },
    changes: [],
    affected: [],
    unchanged: [],
    patch: { timeline: [] },
  });
  let out: Awaited<ReturnType<typeof complete>>;
  try {
    out = await complete({
    purpose: "impact",
    rules: RULES,
    knowledge: knowledge(memoryText("latest"), corpusText()),
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
  } catch (e) {
    return { sources: sourcesInfo, transcribed, transcriptionError, llmError: (e as Error).message, draft: skeleton(`Analyse automatique indisponible : ${(e as Error).message}`) };
  }
  const raw = out.text;
  let draft: unknown;
  try {
    draft = pruneUnchanged(parseLenient(raw) as Record<string, unknown>, fresh.map((s) => s.id));
  } catch {
    draft = { ...skeleton("Le modèle n'a pas produit de JSON exploitable"), brut: raw };
  }
  return { sources: sourcesInfo, transcribed, transcriptionError, provider: out.provider, model: out.model, draft };
}

/** JSON du LLM : texte autour ignoré, puis réparation des fautes courantes (clé sans guillemets, virgule finale). */
export function parseLenient(raw: string): unknown {
  const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  try {
    return JSON.parse(json);
  } catch {
    // Fautes typiques des LLM (guillemet manquant, clé nue, virgule finale, texte autour) : réparation dédiée
    return JSON.parse(jsonrepair(json));
  }
}

/**
 * Garde-fous déterministes sur le brouillon du LLM :
 * 1. un élément identique au baseline est retiré (il ne serait pas un changement) ;
 * 2. un élément déclaré « inchangé » par le brouillon lui-même ne peut pas être modifié ;
 * 3. un élément modifié doit citer la nouvelle source : sinon, rien dans l'événement ne justifie le changement.
 * Chaque retrait est listé avec sa raison, pour la relecture humaine.
 */
export function pruneUnchanged(draft: Record<string, unknown>, freshIds: string[] = []): Record<string, unknown> {
  const baseline = JSON.parse(readFileSync(join(MEMORY, "baseline.json"), "utf8")) as Record<string, unknown>;
  const patch = (draft.patch ?? {}) as Record<string, unknown>;
  const declaredUnchanged = new Set(((draft.unchanged ?? []) as { ref?: string }[]).map((u) => String(u.ref ?? "").trim()));
  const same = (a: Record<string, unknown>, b: Record<string, unknown>) =>
    Object.keys(a).every((k) => k.startsWith("_") || JSON.stringify(a[k]) === JSON.stringify(b[k]));
  // JSON.stringify ne met pas d'espaces : la citation de la nouvelle source s'écrit exactement "s":"<id>"
  const citesEvent = (it: unknown) => freshIds.some((id) => JSON.stringify(it).includes(`"s":${JSON.stringify(id)}`));
  const removed: Record<string, string> = {};
  for (const [key, items] of Object.entries(patch)) {
    const base = baseline[key];
    if (key === "timeline" || !Array.isArray(items) || !Array.isArray(base)) continue;
    patch[key] = items.filter((it: Record<string, unknown>) => {
      const k = String(it.id ?? it.title);
      const b = (base as Record<string, unknown>[]).find((x) => String(x.id ?? x.title) === k);
      if (b && same(it, b)) removed[k] = "identique au baseline";
      else if (declaredUnchanged.has(k)) removed[k] = "déclaré inchangé par le brouillon";
      else if (freshIds.length && !citesEvent(it)) removed[k] = "ne cite pas la nouvelle source";
      return !(k in removed);
    });
  }
  return { ...draft, patch, ...(Object.keys(removed).length ? { _retiresDuPatch: removed } : {}) };
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
