// Logique pure de superposition des mises à jour (sans dépendance Vite) : partagée par l'app et les scripts d'export.
import type { Memory, Update } from "./types";

type Keyed = { id?: string; title?: string };
const keyOf = (x: Keyed) => x.id ?? x.title ?? "";

function mergeById<T extends Keyed>(base: T[], patch: Keyed[] | undefined, changed: Set<string>): T[] {
  if (!patch) return base;
  const out = base.map((x) => ({ ...x }));
  for (const p of patch) {
    const i = out.findIndex((x) => keyOf(x) === keyOf(p));
    if (i >= 0) out[i] = { ...out[i], ...p } as T;
    else out.push(p as T);
    changed.add(keyOf(p));
  }
  return out;
}

/** Fonction pure : le baseline passé en entrée n'est jamais modifié. */
export function applyUpdates(base: Memory, list: Update[], version: string): Memory {
  if (version === "baseline") return { ...base, changed: new Set() };
  const changed = new Set<string>();
  let mem: Memory = structuredClone({ ...base, changed: undefined });
  for (const u of list) {
    const p = u.patch;
    mem = {
      ...mem,
      version: u.version,
      label: u.label,
      asOf: u.asOf,
      topics: mergeById(mem.topics, p.topics, changed),
      decisions: mergeById(mem.decisions, p.decisions, changed),
      goLiveConditions: mergeById(mem.goLiveConditions, p.goLiveConditions, changed),
      actions: mergeById(mem.actions, p.actions, changed),
      risks: mergeById(mem.risks, p.risks, changed),
      contradictions: mergeById(mem.contradictions, p.contradictions, changed),
      answers: mergeById(mem.answers, p.answers, changed),
      missing: mergeById(mem.missing, p.missing, changed),
      timeline: [...mem.timeline, ...(p.timeline ?? []).map((t) => ({ ...t, _new: u.version }))].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
      // Sans brief réécrit, le titre indique la version ; l'encadré des changements complète le contenu
      brief: p.brief ?? { ...mem.brief, title: `Brief de reprise — NOVA, état après ${u.version} (${u.asOf.slice(0, 10)})` },
    };
    if (u.version === version) break;
  }
  mem.changed = changed;
  return mem;
}
