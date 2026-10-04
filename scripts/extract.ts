// Extrait tout le corpus NOVA en texte avec repères (ligne / page / cellule / capture).
// Usage : npm run extract   →   data/corpus.json
// Formats : .eml (y compris les pièces jointes absentes du corpus), .txt, .md, .csv, .pdf, .xlsx, .png/.jpg (via transcription).
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { join, relative, extname, basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { extractText, getDocumentProxy } from "unpdf";
import * as XLSX from "xlsx";

const ROOT = "NOVA_ETUDIANTS/Projet360_NOVA_ETUDIANTS";
const OUT_DIR = "data";
const RAW_DIR = "public/corpus"; // copie des fichiers bruts pour affichage (PDF, images, Excel)
// Transcriptions des captures, hors du corpus brut : manuelles (relues) ou automatiques (LLM, à relire)
const TRANSCRIPTIONS_DIR = "data/transcriptions";
const IMAGE_EXT = [".png", ".jpg", ".jpeg"];

export type Segment = { ref: string; text: string };
export type Source = {
  id: string;
  path: string;
  /** Chemin du fichier brut servi par l'app (sous public/corpus/), si différent de path (pièce jointe extraite) */
  raw?: string;
  folder: string;
  kind: "email" | "reunion" | "ticket" | "document" | "contrat" | "architecture" | "teams" | "archive" | "evenement" | "autre";
  ext: string;
  title: string;
  meta: Record<string, string>;
  attachments: { filename: string; duplicateOf?: string; extractedAs?: string }[];
  segments: Segment[];
  transcription?: "manuelle" | "automatique";
  /** Pièce jointe : identifiant du courriel parent */
  parent?: string;
};
/** Image sans transcription : le serveur la fait transcrire (LLM vision) puis relance l'extraction. */
export type PendingTranscription = { id: string; raw: string; sidecar: string };

const KIND_BY_FOLDER: Record<string, Source["kind"]> = {
  "01_Courriels": "email",
  "02_Reunions": "reunion",
  "03_Tickets": "ticket",
  "04_Documents_projet": "document",
  "05_Contrats_et_finances": "contrat",
  "06_Architecture_et_decisions": "architecture",
  "07_Conversations_Teams": "teams",
  "08_Archives_et_documents_connexes": "archive",
  "09_Nouvel_evenement": "evenement",
};

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function sourceId(file: string): string {
  const stem = basename(file, extname(file));
  // E05_Retard_integration → E05 ; M06_Transcript… → M06 ; le reste garde son nom complet
  const m = stem.match(/^([EM]\d{2})_/);
  return m ? m[1] : stem;
}

/** Nom de fichier sûr pour une pièce jointe extraite (« dossier/E99.eml#rapport.pdf » → « dossier/E99.eml__rapport.pdf »). */
const flat = (rel: string) => rel.replace(/#/g, "__");

function lines(text: string): Segment[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((t, i) => ({ ref: `L${i + 1}`, text: t }));
}

function decodeQP(s: string): string {
  const bytes: number[] = [];
  const src = s.replace(/=\r?\n/g, "");
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "=" && /^[0-9A-F]{2}$/i.test(src.slice(i + 1, i + 3))) {
      bytes.push(parseInt(src.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(...Buffer.from(src[i], "utf8"));
    }
  }
  return Buffer.from(bytes).toString("utf8");
}

function decodeHeader(v: string): string {
  return v.replace(/=\?utf-8\?([QB])\?([^?]*)\?=/gi, (_, enc: string, data: string) =>
    enc.toUpperCase() === "B" ? Buffer.from(data, "base64").toString("utf8") : decodeQP(data.replace(/_/g, " ")),
  );
}

function decodeTextPart(headers: string, content: string): string {
  if (/base64/i.test(headers)) return Buffer.from(content.replace(/\s+/g, ""), "base64").toString("utf8");
  if (/quoted-printable/i.test(headers)) return decodeQP(content);
  return content;
}

const htmlToText = (html: string) =>
  html
    .replace(/<(br|\/p|\/div|\/li|\/tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n");

type EmlPart = { filename: string; data: Buffer };

export function parseEml(raw: string, fileIndex: Map<string, string>) {
  const text = raw.replace(/\r\n/g, "\n");
  const [head, ...rest] = text.split("\n\n");
  const body = rest.join("\n\n");
  const headers: Record<string, string> = {};
  for (const line of head.split(/\n(?!\s)/)) {
    const i = line.indexOf(":");
    if (i > 0) headers[line.slice(0, i).trim().toLowerCase()] = decodeHeader(line.slice(i + 1).replace(/\n\s+/g, " ").trim());
  }
  const attachments: Source["attachments"] = [];
  const embedded: EmlPart[] = [];
  let plain = "";
  let html = "";
  const collect = (partBody: string, partHeadersRaw: string) => {
    const boundary = partHeadersRaw.match(/boundary="?([^";\n]+)"?/i)?.[1];
    if (boundary) {
      // Multipart (éventuellement imbriqué : mixed > alternative)
      for (const part of partBody.split(`--${boundary}`).filter((p) => p.trim() && !p.startsWith("--"))) {
        const [ph, ...pb] = part.replace(/^\n/, "").split("\n\n");
        collect(pb.join("\n\n"), ph);
      }
      return;
    }
    const filename = decodeHeader(partHeadersRaw.match(/filename\*?="?([^";\n]+)"?/i)?.[1] ?? partHeadersRaw.match(/name="?([^";\n]+)"?/i)?.[1] ?? "");
    const isAttachment = /attachment/i.test(partHeadersRaw) || (filename && !/text\/(plain|html)/i.test(partHeadersRaw));
    if (isAttachment && filename) {
      const duplicateOf = fileIndex.get(filename);
      attachments.push({ filename, duplicateOf });
      if (!duplicateOf && /base64/i.test(partHeadersRaw)) embedded.push({ filename, data: Buffer.from(partBody.replace(/\s+/g, ""), "base64") });
    } else if (/text\/html/i.test(partHeadersRaw)) {
      html += decodeTextPart(partHeadersRaw, partBody);
    } else {
      plain += decodeTextPart(partHeadersRaw, partBody);
    }
  };
  const topHeaders = `Content-Type: ${headers["content-type"] ?? "text/plain"}\nContent-Transfer-Encoding: ${headers["content-transfer-encoding"] ?? ""}`;
  collect(body, topHeaders);
  if (!plain.trim() && html.trim()) plain = htmlToText(html);

  const meta = {
    date: headers["date"] ?? "",
    from: headers["from"] ?? "",
    to: headers["to"] ?? "",
    cc: headers["cc"] ?? "",
    subject: headers["subject"] ?? "",
  };
  const headerLines: Segment[] = [
    { ref: "Date", text: meta.date },
    { ref: "De", text: meta.from },
    { ref: "À", text: meta.to },
    ...(meta.cc ? [{ ref: "Cc", text: meta.cc }] : []),
    { ref: "Objet", text: meta.subject },
  ];
  return { meta, attachments, embedded, segments: [...headerLines, ...lines(plain.trim())] };
}

export async function parsePdf(buf: Buffer): Promise<Segment[]> {
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(pdf, { mergePages: false });
  return (text as string[]).map((t, i) => ({ ref: `p.${i + 1}`, text: t.trim() }));
}

export function parseXlsx(buf: Buffer): Segment[] {
  const wb = XLSX.read(buf, { type: "buffer", cellDates: true });
  const out: Segment[] = [];
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1:A1");
    for (let r = range.s.r; r <= range.e.r; r++) {
      const cells: string[] = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr];
        if (!cell) continue;
        let v = cell.w ?? String(cell.v);
        if (cell.v instanceof Date) v = cell.v.toISOString().slice(0, 10);
        cells.push(`${addr}=${v}`);
        // Les commentaires de cellule sont des preuves datées : on les garde comme segments propres
        for (const cm of cell.c ?? []) out.push({ ref: `${sheetName}!${addr} (commentaire)`, text: `${cm.a ?? ""}: ${cm.t}` });
      }
      if (cells.length) out.push({ ref: `${sheetName}!ligne ${r + 1}`, text: cells.join(" | ") });
    }
  }
  return out;
}

/** Contenu d'un fichier selon son type ; pour une image, lit la transcription si elle existe. */
async function extractContent(buf: Buffer, ext: string, rel: string, pending: PendingTranscription[], id: string) {
  if (ext === ".pdf") return { segments: await parsePdf(buf) };
  if (ext === ".xlsx" || ext === ".xls") return { segments: parseXlsx(buf) };
  if (IMAGE_EXT.includes(ext)) {
    const sidecar = join(TRANSCRIPTIONS_DIR, `${flat(rel)}.txt`).replace(/\\/g, "/");
    if (existsSync(sidecar)) {
      const text = readFileSync(sidecar, "utf8").trim();
      return { segments: lines(text), transcription: (/^\[Transcription automatique/.test(text) ? "automatique" : "manuelle") as Source["transcription"] };
    }
    pending.push({ id, raw: join(RAW_DIR, flat(rel)).replace(/\\/g, "/"), sidecar });
    return { segments: [] };
  }
  return { segments: lines(buf.toString("utf8").trim()) };
}

function copyRaw(rel: string, data: Buffer) {
  const dest = join(RAW_DIR, flat(rel));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, data);
}

async function main() {
  const files = walk(ROOT);
  const fileIndex = new Map(files.map((f) => [basename(f), sourceId(f)]));
  const sources: Source[] = [];
  const pending: PendingTranscription[] = [];

  for (const file of files) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    const ext = extname(file).toLowerCase();
    const folder = rel.split("/")[0];
    const buf = readFileSync(file);
    const id = sourceId(file);
    const src: Source = { id, path: rel, folder, kind: KIND_BY_FOLDER[folder] ?? "autre", ext, title: basename(file), meta: {}, attachments: [], segments: [] };

    if (ext === ".eml") {
      const r = parseEml(buf.toString("utf8"), fileIndex);
      Object.assign(src, { meta: r.meta, attachments: r.attachments, segments: r.segments });
      src.title = r.meta.subject || src.title;
      // Pièces jointes absentes du corpus : chacune devient une source citable (ex. E99_PJ1)
      let n = 0;
      for (const part of r.embedded) {
        n++;
        const partExt = extname(part.filename).toLowerCase();
        const partRel = `${rel}#${part.filename}`;
        const partId = `${id}_PJ${n}`;
        const content = await extractContent(part.data, partExt, partRel, pending, partId);
        if ([".pdf", ".xlsx", ".xls", ...IMAGE_EXT].includes(partExt)) copyRaw(partRel, part.data);
        sources.push({
          id: partId,
          path: partRel,
          raw: flat(partRel),
          folder,
          kind: src.kind,
          ext: partExt,
          title: `${part.filename} (pièce jointe de ${id})`,
          meta: {},
          attachments: [],
          parent: id,
          ...content,
        });
        const att = src.attachments.find((a) => a.filename === part.filename && !a.extractedAs);
        if (att) att.extractedAs = partId;
      }
    } else {
      Object.assign(src, await extractContent(buf, ext, rel, pending, id));
      if ([".pdf", ".xlsx", ".xls", ...IMAGE_EXT].includes(ext)) {
        const dest = join(RAW_DIR, rel);
        mkdirSync(dirname(dest), { recursive: true });
        copyFileSync(file, dest);
      }
    }
    sources.push(src);
  }

  sources.sort((a, b) => a.path.localeCompare(b.path));
  const ids = new Set<string>();
  for (const s of sources) {
    if (ids.has(s.id)) throw new Error(`Identifiant de source en double : ${s.id}`);
    ids.add(s.id);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "corpus.json"), JSON.stringify({ generatedAt: new Date().toISOString(), sources, pendingTranscriptions: pending }, null, 1));

  // Contrôle de complétude contre le MANIFEST fourni
  const manifest = readFileSync(join(ROOT, "MANIFEST.csv"), "utf8").trim().split(/\r?\n/).slice(1).map((l) => l.split(",")[0]);
  const missing = manifest.filter((m) => !sources.some((s) => s.path === m));
  console.log(`${sources.length} sources extraites → ${OUT_DIR}/corpus.json`);
  if (missing.length) console.warn(`Absents du corpus : ${missing.join(", ")}`);
  if (pending.length) console.warn(`Images sans transcription : ${pending.map((p) => p.id).join(", ")}`);
}

// Exécuté seulement en ligne de commande (les fonctions restent importables par les tests)
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
