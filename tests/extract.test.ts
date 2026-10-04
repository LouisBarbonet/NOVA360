// Formats possibles du nouvel événement : chaque cas doit produire des segments citables.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { parseEml, parsePdf, parseXlsx } from "../scripts/extract";

const ROOT = "NOVA_ETUDIANTS/Projet360_NOVA_ETUDIANTS";
const pdf = readFileSync(`${ROOT}/05_Contrats_et_finances/INV-003.pdf`);
const png = readFileSync(`${ROOT}/03_Tickets/OPS-601_runbook.png`);
const b64 = (b: Buffer) => b.toString("base64").replace(/(.{76})/g, "$1\n");

describe("courriel d'événement", () => {
  const eml = [
    "Date: Fri, 02 Oct 2026 09:00:00 -0400",
    "From: Julien Moreau <julien.moreau@boreal.example>",
    "Subject: =?utf-8?Q?NOVA_-_facture_corrig=C3=A9e?=",
    'Content-Type: multipart/mixed; boundary="XYZ"',
    "",
    "--XYZ",
    'Content-Type: multipart/alternative; boundary="ALT"',
    "",
    "--ALT",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(Buffer.from("Bonjour,\nVoici la facture INV-004 corrigée.\nJulien", "utf8")),
    "--ALT",
    "Content-Type: text/html; charset=utf-8",
    "",
    "<p>Bonjour</p>",
    "--ALT--",
    "--XYZ",
    "Content-Type: application/pdf",
    "Content-Transfer-Encoding: base64",
    'Content-Disposition: attachment; filename="INV-004.pdf"',
    "",
    b64(pdf),
    "--XYZ",
    "Content-Type: image/png",
    "Content-Transfer-Encoding: base64",
    'Content-Disposition: attachment; filename="capture.png"',
    "",
    b64(png),
    "--XYZ",
    "Content-Type: application/pdf",
    "Content-Transfer-Encoding: base64",
    'Content-Disposition: attachment; filename="INV-003.pdf"',
    "",
    b64(pdf),
    "--XYZ--",
  ].join("\r\n");
  const r = parseEml(eml, new Map([["INV-003.pdf", "INV-003"]]));

  it("décode l'objet, le corps base64 et préfère le texte au HTML", () => {
    expect(r.meta.subject).toBe("NOVA - facture corrigée");
    expect(r.segments.map((s) => s.text).join("\n")).toContain("Voici la facture INV-004 corrigée.");
  });
  it("extrait les pièces jointes nouvelles et relie les doublons du corpus", () => {
    expect(r.embedded.map((e) => e.filename)).toEqual(["INV-004.pdf", "capture.png"]);
    expect(r.embedded[0].data.equals(pdf)).toBe(true);
    expect(r.attachments.find((a) => a.filename === "INV-003.pdf")?.duplicateOf).toBe("INV-003");
  });
  it("lit le PDF joint page par page", async () => {
    const pages = await parsePdf(r.embedded[0].data);
    expect(pages[0].ref).toBe("p.1");
    expect(pages[0].text).toContain("INV-003");
  });
});

it("courriel HTML seul : le texte est récupéré", () => {
  const r = parseEml("Subject: Test\nContent-Type: text/html\n\n<p>Le runbook final est <b>approuvé</b>.</p>", new Map());
  expect(r.segments.some((s) => s.text.includes("Le runbook final est approuvé."))).toBe(true);
});

it("classeur Excel : cellules et commentaires datés deviennent des repères", () => {
  const ws = XLSX.utils.aoa_to_sheet([["ID", "Statut"], ["R-01", "Fermé"]]);
  ws["B2"].c = [{ a: "Marc", t: "Fermé le 17 sept. (INT-101)" }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Risques");
  const segs = parseXlsx(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  expect(segs.find((s) => s.ref === "Risques!ligne 2")?.text).toBe("A2=R-01 | B2=Fermé");
  expect(segs.find((s) => s.ref === "Risques!B2 (commentaire)")?.text).toContain("Fermé le 17 sept.");
});
