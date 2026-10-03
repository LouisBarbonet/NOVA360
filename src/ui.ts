import type { Cite, Level } from "./types";
import { getSource } from "./data";

export const esc = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const money = (n: number) => `${n.toLocaleString("fr-CA")} $`;

export const fmtDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" });

export function citeHref(c: Cite): string {
  return `#/source/${encodeURIComponent(c.s)}?r=${encodeURIComponent(c.r)}`;
}

/** Lien de preuve cliquable : « fichier · repère ». */
export function cite(c: Cite): string {
  const src = getSource(c.s);
  const title = src ? `${src.path} — ${c.r}` : `Source inconnue : ${c.s}`;
  return `<a class="cite${src ? "" : " cite-broken"}" href="${citeHref(c)}" title="${esc(title)}">${esc(c.s)}<span>${esc(c.r)}</span></a>`;
}

export const cites = (list: Cite[] | undefined) =>
  list?.length ? `<div class="cites">${list.map(cite).join("")}</div>` : "";

export const badge = (text: string, level: Level | string) => `<span class="badge badge-${esc(level)}">${esc(text)}</span>`;

/** Transforme les marqueurs [[ID:repère]] produits par le chat en liens de preuve. */
export function linkifyCitations(text: string): string {
  return esc(text)
    .replace(/\[\[([^\]:]+):([^\]]+)\]\]/g, (_, s: string, r: string) => cite({ s: s.trim(), r: r.trim() }))
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

/** Markdown minimal (titres, listes, gras, code, paragraphes) pour le mode d'emploi. */
export function markdown(md: string): string {
  const inline = (s: string) =>
    esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const out: string[] = [];
  let list = false;
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^(#{1,3}) (.*)/);
    const li = line.match(/^\s*[-*] (.*)/) ?? line.match(/^\s*\d+\. (.*)/);
    if (!li && list) {
      out.push("</ul>");
      list = false;
    }
    if (h) out.push(`<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`);
    else if (li) {
      if (!list) out.push("<ul>");
      list = true;
      out.push(`<li>${inline(li[1])}</li>`);
    } else if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push("</ul>");
  return out.join("\n");
}
