// Résolution d'un repère (L5-L7, p.1, Feuille!E7, capture) vers les segments du corpus : partagé par l'app et l'export.
import type { Segment, Source } from "./types";

export function refMatches(segRef: string, r: string): boolean {
  if (!r) return false;
  if (r === "capture") return true;
  const range = r.match(/^L(\d+)(?:-L(\d+))?$/);
  if (range) {
    const n = Number(segRef.slice(1));
    return segRef.startsWith("L") && n >= Number(range[1]) && n <= Number(range[2] ?? range[1]);
  }
  const cell = r.match(/^(.+)!([A-Z]+)(\d+)$/);
  if (cell) return segRef === `${cell[1]}!ligne ${cell[3]}`;
  return segRef === r;
}

/** Texte cité, réduit à la cellule pour un repère Excel et tronqué pour rester lisible. */
export function excerpt(src: Source, r: string, max = 420): string {
  const segs: Segment[] = src.segments.filter((g) => refMatches(g.ref, r) && g.text.trim());
  const cell = r.match(/^.+!([A-Z]+\d+)$/)?.[1];
  let text = segs
    .map((g) => (cell ? (g.text.split(" | ").find((c) => c.startsWith(`${cell}=`)) ?? g.text) : g.text))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (src.ext === ".png") text = `[capture] ${text.replace(/^\[Transcription manuelle de capture d'écran\]\s*/, "")}`;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
