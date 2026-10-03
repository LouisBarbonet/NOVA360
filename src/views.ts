import MiniSearch from "minisearch";
import { corpus, getSource, updates, baseline } from "./data";
import type { Cite, Memory, Source, Update } from "./types";
import { badge, cite, cites, esc, fmtDate, markdown, money } from "./ui";
import { excerpt, refMatches } from "./evidence";
import modeEmploi from "../MODE_EMPLOI.md?raw";

const isChanged = (m: Memory, key: string) => (m.changed?.has(key) ? " changed" : "");
const changedTag = (m: Memory, key: string) => (m.changed?.has(key) ? `<span class="tag-changed">modifié · ${esc(m.version)}</span>` : "");

// ───────────────────────── Brief ─────────────────────────
export function viewBrief(m: Memory): string {
  const gl = m.goLiveConditions
    .map((g) => {
      const acts = g.actions.map((id) => m.actions.find((a) => a.id === id)).filter(Boolean);
      return `<tr class="${isChanged(m, g.id)}">
        <td><strong>${esc(g.id)}</strong> ${esc(g.title)} ${changedTag(m, g.id)}</td>
        <td>${badge(g.status, g.level)}</td>
        <td>${acts.map((a) => `<div><a href="#/actions">${esc(a!.id)}</a> ${esc(a!.owner)} — <em>${esc(a!.due)}</em></div>`).join("")}</td>
        <td>${cites(g.sources)}</td></tr>`;
    })
    .join("");
  return `
  <section class="brief">
    <div class="brief-head">
      <h1>${esc(m.brief.title)}</h1>
      <button class="no-print" onclick="window.print()">Imprimer / PDF</button>
    </div>
    <p class="muted">${esc(m.label)}</p>
    <dl class="brief-grid">
      ${m.brief.sections.map((s) => `<dt>${esc(s.theme)}</dt><dd>${esc(s.text)} ${cites(s.sources)}</dd>`).join("")}
    </dl>
    <h2>Conditions de go-live → actions</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Condition</th><th>Statut</th><th>Actions · responsable · échéance</th><th>Preuves</th></tr></thead>
      <tbody>${gl}</tbody>
    </table></div>
  </section>
  <section class="no-print">
    <h2>État par sujet</h2>
    <div class="cards">
      ${m.topics
        .map(
          (t) => `<article class="card lvl-${t.level}${isChanged(m, t.id)}">
            <header><h3>${esc(t.title)}</h3>${changedTag(m, t.id)}</header>
            <p class="status">${esc(t.status)}</p>
            <p>${esc(t.summary)}</p>${cites(t.sources)}
            <a class="more" href="#/chronologie?topic=${t.id}">Chronologie →</a>
          </article>`,
        )
        .join("")}
    </div>
  </section>`;
}

// ───────────────────────── Questions ─────────────────────────
export function viewQuestions(m: Memory): string {
  return `<h1>Réponses aux dix questions</h1>
  <p class="muted">Chaque réponse cite un fichier et un repère précis. Cliquez une preuve pour ouvrir le passage surligné.</p>
  ${m.answers
    .map(
      (a) => `<article class="answer${isChanged(m, a.id)}" id="${a.id}">
        <h2><span class="qid">${esc(a.id)}</span> ${esc(a.question)} ${changedTag(m, a.id)}</h2>
        <p class="short">${esc(a.short)}</p>
        <details open><summary>Détail, nuances et raisonnement</summary><p>${esc(a.detail)}</p></details>
        ${cites(a.sources)}
      </article>`,
    )
    .join("")}`;
}

// ───────────────────────── Chronologie ─────────────────────────
const TYPES = ["proposition", "décision", "livraison", "validation", "risque", "fait"];
export function viewTimeline(m: Memory, params: URLSearchParams): string {
  const topic = params.get("topic") ?? "";
  const type = params.get("type") ?? "";
  const events = m.timeline.filter((e) => (!topic || e.topic === topic) && (!type || e.type === type));
  const chip = (key: string, val: string, label: string, cur: string) => {
    const p = new URLSearchParams(params);
    if (val) p.set(key, val);
    else p.delete(key);
    return `<a class="chip${cur === val ? " active" : ""}" href="#/chronologie?${p}">${esc(label)}</a>`;
  };
  return `<h1>Chronologie</h1>
  <p class="muted">Distingue <strong>proposition</strong>, <strong>décision</strong>, <strong>livraison</strong> (annoncée par le fournisseur) et <strong>validation</strong> (acceptée par le responsable).</p>
  <div class="chips">${chip("type", "", "Tous types", type)}${TYPES.map((t) => chip("type", t, t, type)).join("")}</div>
  <div class="chips">${chip("topic", "", "Tous sujets", topic)}${m.topics.map((t) => chip("topic", t.id, t.title, topic)).join("")}</div>
  <ol class="timeline">
    ${events
      .map(
        (e) => `<li class="ev ev-${esc(e.type)}${(e as { _new?: string })._new ? " changed" : ""}">
          <time>${fmtDate(e.date)}</time>
          <div><span class="type">${esc(e.type)}</span> ${esc(e.title)}
          ${(e as { _new?: string })._new ? `<span class="tag-changed">nouveau · ${esc((e as { _new?: string })._new)}</span>` : ""}
          ${cites(e.sources)}</div>
        </li>`,
      )
      .join("")}
  </ol>`;
}

// ───────────────────────── Décisions ─────────────────────────
export function viewDecisions(m: Memory): string {
  return `<h1>Décisions</h1>
  <p class="muted">Qui a décidé, qui avait proposé, pourquoi, et ce qui est encore en vigueur.</p>
  ${m.decisions
    .map(
      (d) => `<article class="card${isChanged(m, d.id)}">
        <header><h3>${esc(d.id)} — ${esc(d.title)}</h3>${badge(d.status, d.status.startsWith("en vigueur") ? "ok" : "info")}${changedTag(m, d.id)}</header>
        <p><strong>${fmtDate(d.date)}</strong> · Décidé par : ${esc(d.by)}${d.proposedBy ? ` · Proposé par : ${esc(d.proposedBy)}` : ""}</p>
        <p><strong>Pourquoi :</strong> ${esc(d.why)}</p>
        ${d.replacedBy ? `<p class="muted">Remplacée en partie par : ${esc(d.replacedBy)}</p>` : ""}
        ${cites(d.sources)}
      </article>`,
    )
    .join("")}`;
}

// ───────────────────────── Contradictions ─────────────────────────
export function viewContradictions(m: Memory): string {
  return `<h1>Contradictions résolues</h1>
  <p class="muted">Chaque conflit est tranché par l'<strong>autorité</strong> de la source ou la <strong>date des faits</strong>, et pas par la date du fichier.</p>
  ${m.contradictions
    .map(
      (c) => `<article class="card${isChanged(m, c.id)}">
        <header><h3>${esc(c.id)} — ${esc(c.title)}</h3>${badge(`tranché par : ${c.basis}`, "info")}${changedTag(m, c.id)}</header>
        <ul class="claims">${c.claims
          .map((cl) => `<li class="verdict-${cl.verdict === "retenu" ? "ok" : "old"}">${badge(cl.verdict, cl.verdict === "retenu" ? "ok" : "warn")} ${esc(cl.text)} ${cites(cl.sources)}</li>`)
          .join("")}</ul>
        <p><strong>Résolution :</strong> ${esc(c.resolution)}</p>
        ${cites(c.sources)}
        ${c.action ? `<p class="muted">Action corrective : <a href="#/actions">${esc(c.action)}</a></p>` : ""}
      </article>`,
    )
    .join("")}`;
}

// ───────────────────────── Actions, risques, manques ─────────────────────────
export function viewActions(m: Memory, params: URLSearchParams): string {
  const origin = params.get("origin") ?? "";
  const list = m.actions.filter((a) => !origin || a.origin === origin);
  return `<h1>Actions restantes</h1>
  <div class="chips">
    <a class="chip${!origin ? " active" : ""}" href="#/actions">Toutes</a>
    <a class="chip${origin === "engagement documenté" ? " active" : ""}" href="#/actions?origin=engagement documenté">Engagements documentés</a>
    <a class="chip${origin === "recommandation équipe" ? " active" : ""}" href="#/actions?origin=recommandation équipe">Recommandations de notre équipe</a>
  </div>
  <div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Action</th><th>Responsable</th><th>Échéance</th><th>Origine</th><th>Statut</th><th>Preuves</th></tr></thead>
    <tbody>${list
      .map(
        (a) => `<tr class="${isChanged(m, a.id)}">
          <td><strong>${esc(a.id)}</strong>${a.condition ? `<br><small>${esc(a.condition)}</small>` : ""}</td>
          <td>${esc(a.title)} ${changedTag(m, a.id)}</td>
          <td>${esc(a.owner)}<br><small>${esc(a.ownerStatus)}</small></td>
          <td>${esc(a.due)}</td>
          <td>${badge(a.origin, a.origin === "engagement documenté" ? "ok" : "info")}</td>
          <td>${esc(a.status)}</td>
          <td>${cites(a.sources)}</td></tr>`,
      )
      .join("")}</tbody>
  </table></div>

  <h2>Principaux risques aujourd'hui</h2>
  ${m.risks
    .sort((a, b) => a.rank - b.rank)
    .map(
      (r) => `<article class="card${isChanged(m, r.id)}"><header><h3>#${r.rank} ${esc(r.title)}</h3>${badge(r.level, r.level.includes("élevé") ? "bad" : "warn")}${changedTag(m, r.id)}</header>
      <p>${esc(r.why)}</p><p class="muted">Mitigation : ${esc(r.mitigation)}</p>${cites(r.sources)}</article>`,
    )
    .join("")}

  <h2>Informations manquantes ou incertaines</h2>
  <ul class="missing">${m.missing.map((x) => `<li class="${isChanged(m, x.title)}"><strong>${esc(x.title)}</strong> — ${esc(x.detail)} ${cites(x.sources)}</li>`).join("")}</ul>`;
}

// ───────────────────────── Finances ─────────────────────────
export function viewFinances(m: Memory): string {
  const f = m.finances;
  const authorized = f.authorized.reduce((s, x) => s + x.amount, 0);
  const paid = f.invoices.filter((i) => i.status === "Payée").reduce((s, i) => s + i.total, 0);
  const pending = f.invoices.filter((i) => i.status !== "Payée").reduce((s, i) => s + i.total, 0);
  const flagged = f.invoices.flatMap((i) => i.lines.filter((l) => l.flag)).reduce((s, l) => s + l.amount, 0);
  return `<h1>Budget et factures</h1>
  <div class="kpis">
    <div class="kpi"><span>Autorisé</span><strong>${money(authorized)}</strong></div>
    <div class="kpi"><span>Facturé et payé</span><strong>${money(paid)}</strong></div>
    <div class="kpi"><span>En validation</span><strong>${money(pending)}</strong></div>
    <div class="kpi kpi-bad"><span>Facturé sans autorisation</span><strong>${money(flagged)}</strong></div>
  </div>
  <h2>Montant autorisé</h2>
  <ul>${f.authorized.map((a) => `<li>${esc(a.label)} : <strong>${money(a.amount)}</strong> ${cites(a.sources)}</li>`).join("")}
    <li><strong>Total autorisé = ${money(authorized)}</strong></li></ul>
  <h3>Non autorisé (ne compte pas)</h3>
  <ul>${f.notAuthorized.map((a) => `<li>${esc(a.label)} : ${money(a.amount)} ${cites(a.sources)}</li>`).join("")}</ul>
  <h2>Factures NOVA</h2>
  <div class="table-wrap"><table>
    <thead><tr><th>Facture</th><th>Date</th><th>Lignes</th><th>Total</th><th>Statut</th><th>Preuves</th></tr></thead>
    <tbody>${f.invoices
      .map(
        (i) => `<tr class="${i.flag ? "row-bad" : ""}"><td><strong>${esc(i.id)}</strong></td><td>${fmtDate(i.date)}</td>
        <td>${i.lines.map((l) => `<div>${esc(l.label)} : ${money(l.amount)} ${l.flag ? badge(l.flag, "bad") : ""}</div>`).join("")}</td>
        <td>${money(i.total)}</td><td>${badge(i.status, i.status === "Payée" ? "ok" : "warn")}${i.flag ? `<br><small>${esc(i.flag)}</small>` : ""}</td><td>${cites(i.sources)}</td></tr>`,
      )
      .join("")}</tbody>
  </table></div>
  <h3>Exclues (autre projet)</h3>
  <ul>${f.excluded.map((x) => `<li>${esc(x.id)} — ${money(x.amount)} : ${esc(x.reason)} ${cites(x.sources)}</li>`).join("")}</ul>`;
}

// ───────────────────────── Sources ─────────────────────────
const FOLDER_LABEL: Record<string, string> = {
  "01_Courriels": "Courriels",
  "02_Reunions": "Réunions",
  "03_Tickets": "Tickets",
  "04_Documents_projet": "Documents projet",
  "05_Contrats_et_finances": "Contrats et finances",
  "06_Architecture_et_decisions": "Architecture et décisions",
  "07_Conversations_Teams": "Teams",
  "08_Archives_et_documents_connexes": "Archives et documents connexes",
  "09_Nouvel_evenement": "Nouvel événement",
};

export function viewSources(m: Memory): string {
  const noise = new Map(m.noise.map((n) => [n.s, n.reason]));
  const groups = new Map<string, Source[]>();
  for (const s of corpus.sources) groups.set(s.folder, [...(groups.get(s.folder) ?? []), s]);
  return `<h1>Sources (${corpus.sources.length})</h1>
  <p class="muted">Corpus complet. Les sources marquées ⚠ sont du bruit, des doublons ou de l'historique : elles ne servent jamais de preuve indépendante.</p>
  ${[...groups]
    .map(
      ([folder, list]) => `<h2>${esc(FOLDER_LABEL[folder] ?? folder)}</h2><ul class="source-list">${list
        .map(
          (s) => `<li><a href="#/source/${encodeURIComponent(s.id)}">${esc(s.id)}</a> <span class="muted">${esc(s.title !== s.path.split("/").pop() ? s.title : "")}</span>
          ${noise.has(s.id) ? `<span class="noise">⚠ ${esc(noise.get(s.id))}</span>` : ""}</li>`,
        )
        .join("")}</ul>`,
    )
    .join("")}`;
}

export function viewSource(id: string, params: URLSearchParams, m: Memory): string {
  const s = getSource(id);
  if (!s) return `<h1>Source introuvable</h1><p>${esc(id)}</p>`;
  const r = params.get("r") ?? "";
  const cell = r.match(/^.+!([A-Z]+\d+)$/)?.[1];
  const noise = m.noise.find((n) => n.s === s.id);
  // Où cette source est-elle citée dans la mémoire ?
  const usedIn = [
    ...m.answers.filter((a) => a.sources.some((c) => c.s === id)).map((a) => `<a href="#/questions">${a.id}</a>`),
    ...m.decisions.filter((d) => d.sources.some((c) => c.s === id)).map((d) => `<a href="#/decisions">${d.id}</a>`),
    ...m.contradictions.filter((c) => JSON.stringify(c).includes(`"s":"${id}"`)).map((c) => `<a href="#/contradictions">${c.id}</a>`),
    ...m.actions.filter((a) => a.sources.some((c) => c.s === id)).map((a) => `<a href="#/actions">${a.id}</a>`),
  ];
  const raw = `corpus/${s.path}`;
  return `<p><a href="javascript:history.back()">← Retour</a></p>
  <h1>${esc(s.id)}</h1>
  <p class="muted">${esc(s.path)}${s.transcription ? " · <strong>transcription manuelle de la capture</strong>" : ""}</p>
  ${noise ? `<p class="noise">⚠ ${esc(noise.reason)}</p>` : ""}
  ${s.attachments.length ? `<p>Pièces jointes : ${s.attachments.map((a) => (a.duplicateOf ? `${esc(a.filename)} = <a href="#/source/${encodeURIComponent(a.duplicateOf)}">${esc(a.duplicateOf)}</a> (même document, pas une preuve indépendante)` : esc(a.filename))).join(", ")}</p>` : ""}
  ${usedIn.length ? `<p>Cité dans : ${usedIn.join(" · ")}</p>` : ""}
  ${s.ext === ".png" ? `<img class="capture${r === "capture" ? " hl-img" : ""}" src="${raw}" alt="Capture ${esc(s.id)}">` : ""}
  ${s.ext === ".pdf" ? `<p><a href="${raw}" target="_blank" rel="noopener">Ouvrir le PDF original ↗</a></p>` : ""}
  <div class="segments">
    ${s.segments
      .map((g) => {
        const hl = refMatches(g.ref, r);
        let text = esc(g.text);
        if (hl && cell) text = text.replace(new RegExp(`(${cell}=[^|]*)`), "<mark>$1</mark>");
        return `<div class="seg${hl ? " hl" : ""}" ${hl ? 'data-hl="1"' : ""}><span class="ref">${esc(g.ref)}</span><span class="txt">${text || "&nbsp;"}</span></div>`;
      })
      .join("")}
  </div>`;
}

// ───────────────────────── Recherche ─────────────────────────
let index: MiniSearch | null = null;
function getIndex() {
  if (index) return index;
  index = new MiniSearch({
    fields: ["text", "title"],
    storeFields: ["sid", "ref", "text"],
    processTerm: (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(),
    searchOptions: { prefix: true, fuzzy: 0.15, boost: { title: 2 }, combineWith: "AND" },
  });
  index.addAll(
    corpus.sources.flatMap((s) =>
      s.segments.filter((g) => g.text.trim()).map((g, i) => ({ id: `${s.id}|${i}`, sid: s.id, ref: g.ref, text: g.text, title: s.title })),
    ),
  );
  return index;
}

export function viewSearch(params: URLSearchParams): string {
  const q = params.get("q") ?? "";
  const results = q ? getIndex().search(q).slice(0, 60) : [];
  return `<h1>Recherche plein texte</h1>
  <form id="search-form" class="search"><input name="q" value="${esc(q)}" placeholder="ex. rollback, CR-04, Canada Central, 22 octobre…" autofocus><button>Chercher</button></form>
  ${q ? `<p class="muted">${results.length} passage(s)</p>` : ""}
  <ul class="results">${results
    .map((r) => `<li>${cite({ s: r.sid as string, r: r.ref as string })} ${esc(r.text as string)}</li>`)
    .join("")}</ul>`;
}

// ───────────────────────── Mise à jour ─────────────────────────
export function viewUpdates(): string {
  const list = updates.length
    ? updates.map(renderUpdate).join("")
    : `<p class="muted">Aucune mise à jour intégrée pour l'instant. Le baseline est l'état courant.</p>`;
  return `<h1>Mises à jour après le baseline</h1>
  <p class="muted">Le baseline (${esc(baseline.label)}) n'est jamais modifié. Chaque événement ajoute une couche datée : choisissez la version en haut de page pour voir l'état avant ou après.</p>
  ${list}
  ${import.meta.env.DEV ? newEventForm() : `<p class="muted">L'intégration d'un nouvel événement se fait en mode développement (<code>npm run dev</code>).</p>`}`;
}

function renderUpdate(u: Update): string {
  return `<article class="update">
    <h2>${esc(u.version)} — ${esc(u.event.title)}</h2>
    <p class="muted">${esc(u.label)}</p>
    <p>${esc(u.event.summary)} ${cites(u.event.sources)}</p>
    <h3>Qu'est-ce qui vient de changer?</h3>
    <div class="table-wrap"><table><thead><tr><th>Élément</th><th>Avant (baseline)</th><th>Après</th><th>Preuves</th></tr></thead>
    <tbody>${u.changes.map((c) => `<tr><td>${esc(c.what)}</td><td class="before">${esc(c.before)}</td><td class="after">${esc(c.after)}</td><td>${cites(c.sources)}</td></tr>`).join("")}</tbody></table></div>
    <h3>Quelles informations précédentes sont affectées?</h3>
    <ul>${u.affected.map((a) => `<li><strong>${esc(a.ref)}</strong> — ${esc(a.impact)} ${cites(a.sources)}</li>`).join("")}</ul>
    ${u.unchanged?.length ? `<h3>Ce qui ne change PAS</h3><ul>${u.unchanged.map((a) => `<li><strong>${esc(a.ref)}</strong> — ${esc(a.why)} ${cites(a.sources)}</li>`).join("")}</ul>` : ""}
    <h3>Quelles actions devraient être prises?</h3>
    <ul>${(u.patch.actions ?? []).map((a) => {
      const act = a as unknown as { id: string; title: string; owner: string; due: string; origin: string; sources: { s: string; r: string }[] };
      return `<li><strong>${esc(act.id)}</strong> ${esc(act.title)} — ${esc(act.owner)} · ${esc(act.due)} ${badge(act.origin, act.origin === "engagement documenté" ? "ok" : "info")} ${cites(act.sources)}</li>`;
    }).join("")}</ul>
    <p><a href="#/brief" data-version="${esc(u.version)}" class="switch-version">Voir le brief dans la version ${esc(u.version)} →</a></p>
  </article>`;
}

function newEventForm(): string {
  return `<section class="card new-event">
    <h2>Intégrer un nouvel événement</h2>
    <ol class="muted">
      <li>Collez le texte de l'événement (ou déposez le fichier dans <code>NOVA_ETUDIANTS/…/09_Nouvel_evenement/</code> et laissez le texte vide).</li>
      <li>Le système extrait la source, puis le LLM rédige un brouillon d'impact (changements, éléments touchés, actions) avec ses citations.</li>
      <li>L'équipe relit et corrige le JSON, puis l'enregistre comme nouvelle version. Le baseline reste intact.</li>
    </ol>
    <form id="event-form">
      <label>Identifiant / titre court <input name="title" placeholder="ex. Courriel Sophie 1er octobre" required></label>
      <label>Texte de l'événement <textarea name="text" rows="6" placeholder="Collez ici le courriel, la note ou la transcription…"></textarea></label>
      <button>1. Ingérer et analyser l'impact</button>
    </form>
    <div id="event-status" class="muted"></div>
    <form id="event-save" hidden>
      <label>Brouillon de mise à jour (JSON, modifiable) <textarea name="json" rows="22" class="mono"></textarea></label>
      <button>2. Valider et enregistrer comme nouvelle version</button>
    </form>
  </section>`;
}

// ───────────────────────── Chat ─────────────────────────
export function viewChat(): string {
  const examples = [
    "Quelle est la date de livraison actuellement prévue et pourquoi?",
    "Quelles décisions ont été prises concernant le fournisseur?",
    "Quels engagements ne sont toujours pas complétés?",
    "Existe-t-il des informations contradictoires?",
    "Quels sont les trois principaux risques du projet aujourd'hui?",
    "Pourquoi la décision Canada Central a-t-elle été prise?",
    "Qu'est-ce qui a changé depuis la semaine dernière?",
    "Si je devais reprendre le projet demain matin, que devrais-je savoir?",
  ];
  return `<h1>Interroger le projet</h1>
  <p class="muted">Réponses générées à partir du corpus et de la mémoire, avec citations cliquables. Le LLM peut se tromper : vérifiez toujours les preuves citées.</p>
  <div class="chips">${examples.map((e) => `<button class="chip example">${esc(e)}</button>`).join("")}</div>
  <div id="chat-log" class="chat-log"></div>
  <form id="chat-form" class="search"><input name="q" placeholder="Posez une question en langage naturel…" autocomplete="off"><button>Envoyer</button></form>`;
}

// ───────────────────────── Personnes / mode d'emploi ─────────────────────────
export function viewPeople(m: Memory): string {
  return `<h1>Personnes et rôles</h1><div class="table-wrap"><table><thead><tr><th>Nom</th><th>Rôle</th><th>Organisation</th><th>Preuves</th></tr></thead><tbody>
  ${m.people.map((p) => `<tr><td><strong>${esc(p.name)}</strong></td><td>${esc(p.role)}</td><td>${esc(p.org)}</td><td>${cites(p.sources)}</td></tr>`).join("")}
  </tbody></table></div>`;
}

export const viewHelp = () => `<article class="prose">${markdown(modeEmploi)}</article>`;


// ───────────────────────── Dossier de décisions (preuves en extraits) ─────────────────────────
function quote(c: Cite): string {
  const src = getSource(c.s);
  return `<blockquote class="quote">${cite(c)} ${src ? esc(excerpt(src, c.r)) : ""}</blockquote>`;
}

export function viewDossier(m: Memory): string {
  return `<h1>Dossier de décisions et preuves</h1>
  <p class="muted">Pour chaque décision : qui l'a proposée, qui l'a prise, pourquoi, et la chaîne des faits du sujet (proposition → décision → livraison → validation), avec l'extrait exact de chaque preuve.</p>
  <div class="toc">${m.decisions.map((d) => `<a href="#/dossier?d=${d.id}" data-anchor="${d.id}">${esc(d.id)}</a>`).join("")}</div>
  ${m.decisions
    .map((d) => {
      const chain = m.timeline.filter((e) => e.topic === d.topic);
      const conflicts = m.contradictions.filter((c) => c.topic === d.topic);
      return `<article class="card dossier${isChanged(m, d.id)}" id="${d.id}">
        <header><h2>${esc(d.id)} — ${esc(d.title)}</h2>${badge(d.status, d.status.startsWith("en vigueur") ? "ok" : "info")}${changedTag(m, d.id)}</header>
        <p><strong>${fmtDate(d.date)}</strong> · <strong>Décidé par :</strong> ${esc(d.by)}${d.proposedBy ? ` · <strong>Proposé par :</strong> ${esc(d.proposedBy)}` : ""}</p>
        <p><strong>Pourquoi :</strong> ${esc(d.why)}</p>
        <h3>Preuves de la décision</h3>${d.sources.map(quote).join("")}
        ${chain.length ? `<h3>Chaîne des faits du sujet</h3><ol class="timeline compact">${chain
          .map((e) => `<li class="ev ev-${esc(e.type)}"><time>${fmtDate(e.date)}</time><div><span class="type">${esc(e.type)}</span> ${esc(e.title)}${e.sources.map(quote).join("")}</div></li>`)
          .join("")}</ol>` : ""}
        ${conflicts.length ? `<h3>Contradictions liées</h3><ul>${conflicts.map((c) => `<li><a href="#/contradictions">${esc(c.id)}</a> ${esc(c.title)} — <em>${esc(c.resolution)}</em></li>`).join("")}</ul>` : ""}
      </article>`;
    })
    .join("")}`;
}
