// Extrait tout le corpus NOVA en texte avec repères (ligne / page / cellule).
// Usage : npm run extract   →   public/data/corpus.json
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { join, relative, extname, basename, dirname } from "node:path";
import { extractText, getDocumentProxy } from "unpdf";
import * as XLSX from "xlsx";

const ROOT = "NOVA_ETUDIANTS/Projet360_NOVA_ETUDIANTS";
const OUT_DIR = "data";
const RAW_DIR = "public/corpus"; // copie des fichiers bruts pour affichage (PDF, PNG)
// Transcriptions manuelles des captures (Claude vision + relecture humaine), hors du corpus brut
const TRANSCRIPTIONS_DIR = "data/transcriptions";

export type Segment = { ref: string; text: string };
export type Source = {
  id: string;
  path: string;
  folder: string;
  kind: "email" | "reunion" | "ticket" | "document" | "contrat" | "architecture" | "teams" | "archive" | "evenement" | "autre";
  ext: string;
  title: string;
  meta: Record<string, string>;
  attachments: { filename: string; duplicateOf?: string }[];
  segments: Segment[];
  transcription?: "manuelle";
};

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
    enc.toUpperCase() === "B"
      ? Buffer.from(data, "base64").toString("utf8")
      : decodeQP(data.replace(/_/g, " ")),
  );
}

function parseEml(raw: string, fileIndex: Map<string, string>) {
  const text = raw.replace(/\r\n/g, "\n");
  const [head, ...rest] = text.split("\n\n");
  const body = rest.join("\n\n");
  const headers: Record<string, string> = {};
  for (const line of head.split(/\n(?!\s)/)) {
    const i = line.indexOf(":");
    if (i > 0) headers[line.slice(0, i).trim().toLowerCase()] = decodeHeader(line.slice(i + 1).trim());
  }
  const attachments: Source["attachments"] = [];
  let plain = body;
  const boundary = headers["content-type"]?.match(/boundary="([^"]+)"/)?.[1];
  if (boundary) {
    const parts = body.split(`--${boundary}`).filter((p) => p.trim() && !p.startsWith("--"));
    plain = "";
    for (const part of parts) {
      const [ph, ...pb] = part.replace(/^\n/, "").split("\n\n");
      const filename = ph.match(/filename="([^"]+)"/)?.[1];
      if (filename) {
        attachments.push({ filename, duplicateOf: fileIndex.get(filename) });
      } else if (/text\/plain/i.test(ph)) {
        const content = pb.join("\n\n");
        plain += /quoted-printable/i.test(ph) ? decodeQP(content) : content;
      }
    }
  } else if (/quoted-printable/i.test(headers["content-transfer-encoding"] ?? "")) {
    plain = decodeQP(body);
  }
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
  return { meta, attachments, segments: [...headerLines, ...lines(plain.trim())] };
}

async function parsePdf(buf: Buffer): Promise<Segment[]> {
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(pdf, { mergePages: false });
  return (text as string[]).map((t, i) => ({ ref: `p.${i + 1}`, text: t.trim() }));
}

function parseXlsx(buf: Buffer): Segment[] {
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

async function main() {
  const files = walk(ROOT);
  const fileIndex = new Map(files.map((f) => [basename(f), sourceId(f)]));
  const sources: Source[] = [];
  const missingTranscriptions: string[] = [];

  for (const file of files) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    const ext = extname(file).toLowerCase();
    const folder = rel.split("/")[0];
    const buf = readFileSync(file);
    const src: Source = {
      id: sourceId(file),
      path: rel,
      folder,
      kind: KIND_BY_FOLDER[folder] ?? "autre",
      ext,
      title: basename(file),
      meta: {},
      attachments: [],
      segments: [],
    };

    if (ext === ".eml") {
      const r = parseEml(buf.toString("utf8"), fileIndex);
      Object.assign(src, r);
      src.title = r.meta.subject || src.title;
    } else if (ext === ".pdf") {
      src.segments = await parsePdf(buf);
    } else if (ext === ".xlsx") {
      src.segments = parseXlsx(buf);
    } else if (ext === ".png") {
      const sidecar = join(TRANSCRIPTIONS_DIR, `${rel}.txt`);
      if (existsSync(sidecar)) {
        src.segments = lines(readFileSync(sidecar, "utf8").trim());
        src.transcription = "manuelle";
      } else {
        missingTranscriptions.push(rel);
      }
    } else {
      src.segments = lines(buf.toString("utf8").trim());
    }

    if ([".pdf", ".png", ".xlsx"].includes(ext)) {
      const dest = join(RAW_DIR, rel);
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(file, dest);
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
  writeFileSync(join(OUT_DIR, "corpus.json"), JSON.stringify({ generatedAt: new Date().toISOString(), sources }, null, 1));

  // Contrôle de complétude contre le MANIFEST fourni
  const manifest = readFileSync(join(ROOT, "MANIFEST.csv"), "utf8").trim().split(/\r?\n/).slice(1).map((l) => l.split(",")[0]);
  const missing = manifest.filter((m) => !sources.some((s) => s.path === m));
  console.log(`${sources.length} sources extraites → ${OUT_DIR}/corpus.json`);
  if (missing.length) console.warn(`Absents du corpus : ${missing.join(", ")}`);
  if (missingTranscriptions.length) console.warn(`Captures sans transcription (.png.txt) : ${missingTranscriptions.join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
