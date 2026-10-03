import { expect, it } from "vitest";
import { applyUpdates, baseline } from "../src/data";
import type { Update } from "../src/types";
import u1 from "./fixtures/U1_repetition.json";

const after = applyUpdates(baseline, [u1 as unknown as Update], "U1");

it("ne modifie jamais le baseline", () => {
  const snapshot = JSON.stringify(baseline);
  applyUpdates(baseline, [u1 as unknown as Update], "U1");
  expect(JSON.stringify(baseline)).toBe(snapshot);
  expect(baseline.goLiveConditions.find((g) => g.id === "GL-1")!.level).toBe("bad");
});

it("fusionne par id, ajoute les nouveaux éléments et les signale", () => {
  const gl1 = after.goLiveConditions.find((g) => g.id === "GL-1")!;
  expect(gl1.level).toBe("ok");
  expect(gl1.title).toBe("Validation sécurité de SEC-210"); // champs non patchés conservés
  expect(after.actions.some((a) => a.id === "A-14")).toBe(true);
  expect(after.actions).toHaveLength(baseline.actions.length + 1);
  expect([...after.changed!]).toEqual(expect.arrayContaining(["GL-1", "A-14"]));
});

it("ne ferme aucune autre condition", () => {
  for (const id of ["GL-2", "GL-3"]) {
    expect(after.goLiveConditions.find((g) => g.id === id)).toEqual(baseline.goLiveConditions.find((g) => g.id === id));
    expect(after.changed!.has(id)).toBe(false);
  }
});

it("ajoute l'événement à la chronologie, triée par date", () => {
  expect(after.timeline.at(-1)!.title).toBe("SEC-210 accepté");
  expect(after.timeline).toHaveLength(baseline.timeline.length + 1);
});
