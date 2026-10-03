import type { Cite, Level } from "./types";
import { getSource } from "./data";
import { refMatches } from "./evidence";

export const esc = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const money = (n: number) => `${n.toLocaleString("fr-CA")} $`;

export const fmtDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" });

export function citeHref(c: Cite): string {
  return `#/source/${encodeURIComponent(c.s)}?r=${encodeURIComponent(c.r)}`;
}

/** Une citation est valide si la source existe et si le repère y désigne au moins un passage. */
export function citeIsValid(c: Cite): boolean {
  const src = getSource(c.s);
  return !!src && src.segments.some((g) => refMatches(g.ref, c.r));
}

/** Lien de preuve cliquable : « fichier · repère ». Rouge si la source ou le repère est introuvable. */
export function cite(c: Cite): string {
  const src = getSource(c.s);
  const ok = citeIsValid(c);
  const title = !src ? `Source inconnue : ${c.s}` : ok ? `${src.path} — ${c.r}` : `Repère introuvable dans ${src.path} : ${c.r}`;
  return `<a class="cite${ok ? "" : " cite-broken"}" href="${citeHref(c)}" title="${esc(title)}">${esc(c.s)}<span>${esc(c.r)}</span></a>`;
}

export const cites = (list: Cite[] | undefined) =>
  list?.length ? `<div class="cites">${list.map(cite).join("")}</div>` : "";

export const badge = (text: string, level: Level | string) => `<span class="badge badge-${esc(level)}">${esc(text)}</span>`;

/** Mise en forme d'une ligne : échappement, puis code, gras et (optionnellement) marqueurs de citation. */
function inline(s: string, withCitations: boolean): string {
  let out = esc(s);
  if (withCitations) {
    // Tolère les variantes produites par les LLM : [[ID:r]], [ID:r], [[A:r], [B:r]] et [[ACC-303:L6,L14]].
    // Seuls les identifiants de sources connues deviennent des liens ; le reste est laissé tel quel.
    out = out.replace(/\[{1,2}([A-Za-z0-9_.\-]+):([^\[\]]+?)\]{1,2}/g, (whole, src: string, r: string) =>
      getSource(src.trim())
        ? r.split(/\s*[,;]\s*/).filter(Boolean).map((part) => cite({ s: src.trim(), r: part.trim() })).join("")
        : whole,
    );
  }
  return out
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*([^*\n]+?)\*(?![*\w])/g, "$1<em>$2</em>");
}

/** Markdown minimal : titres, listes, séparateurs, gras, code, paragraphes. */
function render(md: string, withCitations: boolean): string {
  const out: string[] = [];
  let list = false;
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^(#{1,4}) (.*)/);
    const li = line.match(/^\s*[-*] (.*)/) ?? line.match(/^\s*\d+\. (.*)/);
    if (!li && list) {
      out.push("</ul>");
      list = false;
    }
    if (h) out.push(`<h${Math.min(h[1].length + 1, 5)}>${inline(h[2], withCitations)}</h${Math.min(h[1].length + 1, 5)}>`);
    else if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) out.push("<hr>");
    else if (li) {
      if (!list) out.push("<ul>");
      list = true;
      out.push(`<li>${inline(li[1], withCitations)}</li>`);
    } else if (line.trim()) out.push(`<p>${inline(line, withCitations)}</p>`);
  }
  if (list) out.push("</ul>");
  return out.join("\n");
}

/** Réponse du chat : Markdown + marqueurs [[ID:repère]] transformés en liens de preuve. */
export const linkifyCitations = (text: string) => render(text, true);

/** Markdown du mode d'emploi. */
export const markdown = (md: string) => render(md, false);
