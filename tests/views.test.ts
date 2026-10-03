// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { memoryAt, versions, getSource } from "../src/data";
import * as V from "../src/views";

const ALL = (m: ReturnType<typeof memoryAt>) => ({
  brief: V.viewBrief(m),
  questions: V.viewQuestions(m),
  chronologie: V.viewTimeline(m, new URLSearchParams()),
  decisions: V.viewDecisions(m),
  dossier: V.viewDossier(m),
  contradictions: V.viewContradictions(m),
  actions: V.viewActions(m, new URLSearchParams()),
  finances: V.viewFinances(m),
  personnes: V.viewPeople(m),
  sources: V.viewSources(m),
  recherche: V.viewSearch(new URLSearchParams("q=rollback")),
  chat: V.viewChat(),
  maj: V.viewUpdates(),
  aide: V.viewHelp(),
});

describe.each(versions().map((v) => v.id))("version %s", (version) => {
  const m = memoryAt(version);
  for (const [name, html] of Object.entries(ALL(m))) {
    it(`${name} se rend sans valeur manquante ni preuve cassée`, () => {
      expect(html).not.toMatch(/undefined|NaN|\[object Object\]/);
      expect(html).not.toContain("cite-broken");
    });
  }
  it("les dix questions sont présentes avec des preuves", () => {
    expect(m.answers.map((a) => a.id)).toEqual(["Q01", "Q02", "Q03", "Q04", "Q05", "Q06", "Q07", "Q08", "Q09", "Q10"]);
    for (const a of m.answers) expect(a.sources.length).toBeGreaterThan(0);
  });
});

describe("visionneuse de source", () => {
  it("surligne la plage de lignes citée", () => {
    const html = V.viewSource("M04", new URLSearchParams("r=L17-L23"), memoryAt("baseline"));
    expect((html.match(/class="seg hl"/g) ?? []).length).toBe(7);
  });
  it("surligne la cellule Excel citée", () => {
    const html = V.viewSource("Plan_Projet_NOVA_v3_12sept", new URLSearchParams("r=Plan projet!E7"), memoryAt("baseline"));
    expect(html).toContain("<mark>E7=2026-10-15");
  });
  it("affiche la capture et sa transcription", () => {
    const html = V.viewSource("OPS-601_runbook", new URLSearchParams("r=capture"), memoryAt("baseline"));
    expect(html).toContain('src="corpus/03_Tickets/OPS-601_runbook.png"');
    expect(html).toContain("Procédure de retour arrière — TODO");
  });
  it("relie les pièces jointes dupliquées au fichier séparé", () => {
    expect(getSource("E07")!.attachments[0].duplicateOf).toBe("INV-003");
  });
});

describe("cohérence financière", () => {
  it("autorisé = 204 000 $, payé = 132 000 $", () => {
    const f = memoryAt("baseline").finances;
    expect(f.authorized.reduce((s, x) => s + x.amount, 0)).toBe(204000);
    expect(f.invoices.filter((i) => i.status === "Payée").reduce((s, i) => s + i.total, 0)).toBe(132000);
    for (const i of f.invoices) expect(i.lines.reduce((s, l) => s + l.amount, 0)).toBe(i.total);
  });
});

describe("citations produites par le chat", () => {
  it("découpe un repère groupé en plusieurs liens valides", async () => {
    const { linkifyCitations } = await import("../src/ui");
    const html = linkifyCitations("Voir [[ACC-303:L6,L14]] et [[M04:L17-L23]].");
    expect(html.match(/class="cite"/g)).toHaveLength(3);
    expect(html).not.toContain("cite-broken");
  });
});

describe("garde-fou sur les repères", () => {
  it("marque en rouge un repère inexistant même si la source existe", async () => {
    const { linkifyCitations } = await import("../src/ui");
    expect(linkifyCitations("[[M04:L999]]")).toContain("cite-broken");
    expect(linkifyCitations("[[M04:L17-L23]]")).not.toContain("cite-broken");
  });
  it("rend titres, listes et séparateurs du chat", async () => {
    const { linkifyCitations } = await import("../src/ui");
    const html = linkifyCitations("### Titre\n---\n* **gras** [[E05:L5]]");
    expect(html).toContain("<h4>Titre</h4>");
    expect(html).toContain("<hr>");
    expect(html).toContain("<li><strong>gras</strong>");
  });
});

describe("variantes de citations des LLM", () => {
  it("lie [[A:x], [B:y]] et l'italique, sans toucher aux crochets ordinaires", async () => {
    const { linkifyCitations } = await import("../src/ui");
    const html = linkifyCitations("*État* : voir [[SEC-210:L25], [M06:L7]] et [note:importante].");
    expect(html.match(/class="cite"/g)).toHaveLength(2);
    expect(html).toContain("<em>État</em>");
    expect(html).toContain("[note:importante]");
  });
});

describe("réponses pré-enregistrées du chat", () => {
  it("toutes leurs citations pointent vers un passage réel du corpus", async () => {
    const files = import.meta.glob("../data/precomputed/*.json", { eager: true, import: "default" }) as Record<string, { entries: { question: string; answer: string }[] }>;
    const { linkifyCitations } = await import("../src/ui");
    for (const f of Object.values(files)) {
      for (const e of f.entries) {
        const html = linkifyCitations(e.answer);
        expect(html, `citation invalide dans : ${e.question}`).not.toContain("cite-broken");
      }
    }
  });
});

describe("plages de cellules Excel", () => {
  it("résout « Risques!F2-H2 » sur la ligne 2 du registre", async () => {
    const { refMatches } = await import("../src/evidence");
    expect(refMatches("Risques!ligne 2", "Risques!F2-H2")).toBe(true);
    expect(refMatches("Risques!ligne 3", "Risques!F2-H2")).toBe(false);
    expect(refMatches("Risques!ligne 4", "Risques!A2-H5")).toBe(true);
  });
});
