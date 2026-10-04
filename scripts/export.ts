// Génère les livrables Devpost (Markdown + PDF du brief) pour le baseline et chaque mise à jour.
// Usage : npm run export   (après npm run build pour les PDF)
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { applyUpdates } from "../src/merge";
import { excerpt } from "../src/evidence";
import type { Cite, Corpus, Memory, Update } from "../src/types";

const OUT = "livrables";
const corpus: Corpus = JSON.parse(readFileSync("data/corpus.json", "utf8"));
const baseline: Memory = JSON.parse(readFileSync("data/memory/baseline.json", "utf8"));
const updDir = "data/memory/updates";
const updates: Update[] = existsSync(updDir)
  ? readdirSync(updDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(join(updDir, f), "utf8")))
      .sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }))
  : [];
const src = new Map(corpus.sources.map((s) => [s.id, s]));

const money = (n: number) => `${n.toLocaleString("fr-CA")} $`;
/** Repère retrouvable : identifiant, repère et chemin du fichier dans le corpus. */
const ref = (c: Cite) => `\`${c.s}\` · ${c.r} (${src.get(c.s)?.path ?? "source inconnue"})`;
const refs = (l: Cite[] = []) => l.map((c) => `\`${c.s} ${c.r}\``).join(", ");
const quote = (c: Cite) => {
  const s = src.get(c.s);
  return `> ${ref(c)}${s ? ` — « ${excerpt(s, c.r, 300)} »` : ""}`;
};
const cell = (t: string) => t.replace(/\|/g, "\\|").replace(/\n/g, " ");

function brief(m: Memory): string {
  const applied = m.version === "baseline" ? [] : updates.slice(0, updates.findIndex((u) => u.version === m.version) + 1);
  const banner = applied.length
    ? [
        "",
        "> **Changements depuis le baseline du 30 sept.** (le reste du brief est inchangé)",
        ...applied.flatMap((u) => [
          ">",
          `> **${u.version} — ${u.event.title}** (${refs(u.event.sources)})`,
          ...u.changes.map((c) => `> - **${c.what}** : ${c.after} — ${refs(c.sources)}`),
        ]),
        "",
      ].join("\n")
    : "";
  return `# ${m.brief.title}

*${m.label}*
${banner}
${m.brief.sections.map((s) => `**${s.theme}.** ${s.text} — preuves : ${refs(s.sources)}`).join("\n\n")}

## Conditions de go-live → actions

| Condition | Statut | Actions · responsable · échéance | Preuves |
|---|---|---|---|
${m.goLiveConditions
  .map((g) => {
    const acts = g.actions.map((id) => m.actions.find((a) => a.id === id)).filter(Boolean);
    return `| **${g.id}** ${cell(g.title)} | ${cell(g.status)} | ${acts.map((a) => `${a!.id} ${cell(a!.owner)} — *${cell(a!.due)}*`).join("<br>")} | ${refs(g.sources)} |`;
  })
  .join("\n")}
`;
}

function answers(m: Memory): string {
  return `# Réponses aux dix questions — ${m.label}

Chaque réponse cite un fichier du corpus et un repère précis (L = ligne, p. = page, Feuille!cellule, capture), avec l'extrait exact.

${m.answers
  .map(
    (a) => `## ${a.id}. ${a.question}

**Réponse :** ${a.short}

${a.detail}

**Preuves :**

${a.sources.map(quote).join("\n>\n")}
`,
  )
  .join("\n")}`;
}

function memoire(m: Memory): string {
  const f = m.finances;
  return `# Mémoire du projet NOVA — ${m.label}

${m.curation ?? ""}

## Personnes et rôles

| Nom | Rôle | Organisation | Preuves |
|---|---|---|---|
${m.people.map((p) => `| ${p.name} | ${cell(p.role)} | ${p.org} | ${refs(p.sources)} |`).join("\n")}

## Chronologie

Types : **proposition** (suggérée), **décision** (prise par l'autorité), **livraison** (annoncée par le fournisseur), **validation** (acceptée par le responsable), risque, fait.

| Date | Type | Événement | Preuves |
|---|---|---|---|
${m.timeline.map((e) => `| ${e.date} | ${e.type} | ${cell(e.title)} | ${refs(e.sources)} |`).join("\n")}

## Décisions

${m.decisions
  .map(
    (d) => `### ${d.id} — ${d.title} (${d.date})

- **Décidé par :** ${d.by}${d.proposedBy ? `\n- **Proposé par :** ${d.proposedBy}` : ""}
- **Statut :** ${d.status}${d.replacedBy ? ` (remplacée en partie par ${d.replacedBy})` : ""}
- **Pourquoi :** ${d.why}
- **Preuves :** ${refs(d.sources)}`,
  )
  .join("\n\n")}

## Contradictions résolues

${m.contradictions
  .map(
    (c) => `### ${c.id} — ${c.title}

${c.claims.map((cl) => `- **[${cl.verdict}]** ${cl.text} — ${refs(cl.sources)}`).join("\n")}

**Résolution (${c.basis}) :** ${c.resolution}${c.sources?.length ? ` — ${refs(c.sources)}` : ""}${c.action ? `\n\nAction corrective : ${c.action}` : ""}`,
  )
  .join("\n\n")}

## Actions restantes

« Engagement documenté » = prévu dans le corpus ; « recommandation équipe » = proposition de notre équipe, non engagée par le projet.

| ID | Action | Responsable | Échéance | Origine | Statut | Preuves |
|---|---|---|---|---|---|---|
${m.actions.map((a) => `| ${a.id}${a.condition ? ` (${a.condition})` : ""} | ${cell(a.title)} | ${cell(a.owner)} (${a.ownerStatus}) | ${cell(a.due)} | ${a.origin} | ${a.status} | ${refs(a.sources)} |`).join("\n")}

## Principaux risques

${[...m.risks]
  .sort((a, b) => a.rank - b.rank)
  .map((r) => `${r.rank}. **${r.title}** (${r.level}) — ${r.why} *Mitigation : ${r.mitigation}.* ${refs(r.sources)}`)
  .join("\n")}

## Budget et factures (CAD, hors taxes)

- **Autorisé :** ${f.authorized.map((a) => `${a.label} ${money(a.amount)} (${refs(a.sources)})`).join(" + ")} = **${money(f.authorized.reduce((s, x) => s + x.amount, 0))}**
- **Non autorisé :** ${f.notAuthorized.map((a) => `${a.label} ${money(a.amount)} (${refs(a.sources)})`).join("; ")}

| Facture | Date | Lignes | Total | Statut | Preuves |
|---|---|---|---|---|---|
${f.invoices.map((i) => `| ${i.id} | ${i.date} | ${i.lines.map((l) => `${cell(l.label)} ${money(l.amount)}${l.flag ? ` **(${l.flag})**` : ""}`).join("<br>")} | ${money(i.total)} | ${i.status}${i.flag ? ` — ${i.flag}` : ""} | ${refs(i.sources)} |`).join("\n")}

Exclues : ${f.excluded.map((x) => `${x.id} (${money(x.amount)}) — ${x.reason}`).join("; ")}

## Informations manquantes ou incertaines

${m.missing.map((x) => `- **${x.title}** — ${x.detail} ${refs(x.sources)}`).join("\n")}

## Sources écartées ou non indépendantes

${m.noise.map((n) => `- \`${n.s}\` (${src.get(n.s)?.path ?? ""}) — ${n.reason}`).join("\n")}

## Index des sources (${corpus.sources.length})

${corpus.sources.map((s) => `- \`${s.id}\` — ${s.path}${s.transcription ? " (capture, transcription manuelle)" : ""}`).join("\n")}
`;
}

function dossier(m: Memory): string {
  return `# Dossier de décisions et preuves — ${m.label}

${m.decisions
  .map((d) => {
    const chain = m.timeline.filter((e) => e.topic === d.topic);
    return `## ${d.id} — ${d.title}

**${d.date}** · Décidé par : ${d.by}${d.proposedBy ? ` · Proposé par : ${d.proposedBy}` : ""} · Statut : ${d.status}

**Pourquoi :** ${d.why}

### Preuves de la décision

${d.sources.map(quote).join("\n>\n")}

### Chaîne des faits du sujet

${chain.map((e) => `- **${e.date} · ${e.type}** — ${e.title}\n${e.sources.map((c) => `  ${quote(c)}`).join("\n")}`).join("\n")}
`;
  })
  .join("\n")}`;
}

function update(u: Update): string {
  return `# ${u.version} — ${u.event.title}

*${u.label}* — le baseline du 30 septembre est conservé (dossier \`baseline/\`).

${u.event.summary} — ${refs(u.event.sources)}

## Qu'est-ce qui vient de changer?

| Élément | Avant (baseline) | Après | Preuves |
|---|---|---|---|
${u.changes.map((c) => `| ${cell(c.what)} | ${cell(c.before)} | ${cell(c.after)} | ${refs(c.sources)} |`).join("\n")}

## Quelles informations précédentes sont affectées?

${u.affected.map((a) => `- **${a.ref}** — ${a.impact} ${refs(a.sources)}`).join("\n")}

## Ce qui ne change pas

${(u.unchanged ?? []).map((a) => `- **${a.ref}** — ${a.why} ${refs(a.sources)}`).join("\n") || "—"}

## Quelles actions devraient être prises?

${((u.patch.actions ?? []) as unknown as Memory["actions"]).map((a) => `- **${a.id}** ${a.title} — ${a.owner} · ${a.due} · *${a.origin}* ${refs(a.sources)}`).join("\n") || "—"}
`;
}

function printBrief(version: string, pdf: string) {
  const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find(existsSync);
  if (!chrome || !existsSync("dist/index.html")) return console.warn(`PDF non généré (${!chrome ? "Chrome introuvable" : "lancez npm run build"}) : ${pdf}`);
  const url = `${pathToFileURL(resolve("dist/index.html")).href}#/brief?v=${version}`;
  execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=3000", `--print-to-pdf=${resolve(pdf)}`, url], { stdio: "ignore" });
}

rmSync(OUT, { recursive: true, force: true });
const versionsToExport = ["baseline", ...updates.map((u) => u.version)];
for (const v of versionsToExport) {
  const m = applyUpdates(baseline, updates, v);
  const dir = join(OUT, v);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "1_BRIEF.md"), brief(m));
  writeFileSync(join(dir, "2_REPONSES_Q01-Q10.md"), answers(m));
  writeFileSync(join(dir, "3_MEMOIRE.md"), memoire(m));
  writeFileSync(join(dir, "4_DOSSIER_DECISIONS.md"), dossier(m));
  const u = updates.find((x) => x.version === v);
  if (u) writeFileSync(join(dir, "5_MISE_A_JOUR.md"), update(u));
  printBrief(v, join(dir, "1_BRIEF.pdf"));
  console.log(`✓ ${dir}`);
}
copyFileSync("MODE_EMPLOI.md", join(OUT, "MODE_EMPLOI.md"));

// RESULTATS.md : point d'entrée pour une évaluation SANS exécuter le code (lecture directe sur GitHub)
function resultats(): string {
  const latest = versionsToExport[versionsToExport.length - 1];
  const m = applyUpdates(baseline, updates, latest);
  const first = (l: Cite[]) => l.slice(0, 3).map((c) => `\`${c.s}\` ${c.r}`).join(" · ");
  const versionRows = versionsToExport.map((v) => {
    const u = updates.find((x) => x.version === v);
    const label = u ? u.label : baseline.label;
    const files = [
      `[Brief (PDF)](livrables/${v}/1_BRIEF.pdf)`,
      `[Brief](livrables/${v}/1_BRIEF.md)`,
      `[Q01–Q10](livrables/${v}/2_REPONSES_Q01-Q10.md)`,
      `[Mémoire](livrables/${v}/3_MEMOIRE.md)`,
      `[Dossier de décisions](livrables/${v}/4_DOSSIER_DECISIONS.md)`,
      ...(u ? [`[**Mise à jour : changements, impacts, actions**](livrables/${v}/5_MISE_A_JOUR.md)`] : []),
    ];
    return `| **${v}** | ${cell(label)} | ${files.join(" · ")} |`;
  });
  return `# Résultats finaux — NOVA 360

> Tous les résultats sont consultables **directement sur GitHub, sans exécuter de code**. Fichier généré par \`npm run package\` à partir de la mémoire validée (chaque citation est vérifiée contre le corpus).
> Application en ligne (optionnelle) : https://louisbarbonet.github.io/NOVA360/ · Export hors ligne : [NOVA360_remise.zip](NOVA360_remise.zip) (ouvrir \`dist/index.html\`).

## Livrables par version (le baseline est conservé)

| Version | État | Fichiers |
|---|---|---|
${versionRows.join("\n")}

- **Mode d'emploi** (ouverture, navigation, outils, étapes manuelles, limites) : [MODE_EMPLOI.md](MODE_EMPLOI.md)
- **Captures de l'application** : [devpost/captures/](devpost/captures/)
- **Répétitions de mise à jour** (tests d'événements simulés) : [repetitions/README.md](repetitions/README.md)

## Réponses aux dix questions — ${cell(m.label)}

Réponse courte et preuves principales ; le détail, toutes les preuves et leurs extraits exacts sont dans [2_REPONSES_Q01-Q10.md](livrables/${latest}/2_REPONSES_Q01-Q10.md).

| # | Question | Réponse | Preuves principales |
|---|---|---|---|
${m.answers.map((a) => `| ${a.id} | ${cell(a.question)} | ${cell(a.short)} | ${first(a.sources)} |`).join("\n")}

## En chiffres

${corpus.sources.length} fichiers sources · ${m.timeline.length} événements datés · ${m.decisions.length} décisions · ${m.contradictions.length} contradictions résolues · ${m.actions.length} actions (${m.actions.filter((a) => a.origin === "engagement documenté").length} engagements documentés, ${m.actions.filter((a) => a.origin !== "engagement documenté").length} recommandations de l'équipe) · ${m.missing.length} informations manquantes déclarées.
`;
}
writeFileSync("RESULTATS.md", resultats());
console.log(`Livrables écrits dans ${OUT}/ (${versionsToExport.join(", ")}) + RESULTATS.md`);
