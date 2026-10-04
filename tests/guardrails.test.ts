// Garde-fous déterministes appliqués au brouillon d'impact produit par le LLM.
import { expect, it } from "vitest";
import { parseLenient, pruneUnchanged } from "../server/api";
import baseline from "../data/memory/baseline.json";

const gl = (id: string) => structuredClone((baseline as any).goLiveConditions.find((g: any) => g.id === id));
const EVT = "EVT-01_Test";

it("répare le JSON typique d'un LLM (guillemet manquant, texte autour)", () => {
  const d = parseLenient('Voici :\n{ "version": "U1", approver": "Olivier", "patch": {} }\nFin.') as any;
  expect(d.version).toBe("U1");
  expect(d.approver).toBe("Olivier");
});

it("retire l'identique, le « déclaré inchangé » et ce qui ne cite pas l'événement ; garde le vrai changement", () => {
  const gl1 = { ...gl("GL-1"), status: "reformulé sans raison" };
  const gl2 = gl("GL-2");
  const gl3 = { ...gl("GL-3"), status: "Runbook reçu, non approuvé", sources: [{ s: EVT, r: "L5" }] };
  const a01 = { id: "A-01", title: "reformulée", sources: [{ s: "SEC-210", r: "L25" }] };
  const draft = {
    unchanged: [{ ref: "GL-1", why: "rien de nouveau" }],
    patch: { goLiveConditions: [gl1, gl2, gl3], actions: [a01], timeline: [{ date: "2026-10-01", title: "x", sources: [] }] },
  };
  const out = pruneUnchanged(draft, [EVT]) as any;
  expect(out.patch.goLiveConditions.map((g: any) => g.id)).toEqual(["GL-3"]);
  expect(out.patch.actions).toEqual([]);
  expect(out.patch.timeline).toHaveLength(1); // la chronologie n'est jamais filtrée
  expect(out._retiresDuPatch).toEqual({
    "GL-1": "déclaré inchangé par le brouillon",
    "GL-2": "identique au baseline",
    "A-01": "ne cite pas la nouvelle source",
  });
});
