// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { beforeAll, expect, it } from "vitest";

beforeAll(async () => {
  const html = readFileSync("index.html", "utf8");
  document.body.innerHTML = html.slice(html.indexOf("<body>") + 6, html.indexOf("<script"));
  await import("../src/main");
});

const go = (hash: string) => {
  location.hash = hash;
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  return document.getElementById("app")!;
};

it("affiche le brief par défaut avec les 5 thèmes", () => {
  const app = document.getElementById("app")!;
  for (const t of ["Responsable", "Date approuvée et conditions", "Portée", "Budget", "Factures", "Priorités"]) expect(app.textContent).toContain(t);
  expect(document.querySelector("#version option")).not.toBeNull();
});

it("navigue vers chaque page et marque le lien actif", () => {
  for (const r of ["questions", "chronologie", "decisions", "dossier", "contradictions", "actions", "finances", "sources", "recherche", "chat", "mise-a-jour", "aide"]) {
    const app = go(`#/${r}`);
    expect(app.innerHTML.length).toBeGreaterThan(100);
    expect(document.querySelector(`nav a[href="#/${r}"]`)!.classList.contains("active")).toBe(true);
  }
});

it("ouvre une preuve citée avec le passage surligné", () => {
  const app = go("#/source/E05?r=L5-L7");
  expect(app.querySelectorAll(".seg.hl").length).toBe(3);
  expect(app.textContent).toContain("22 octobre");
});
