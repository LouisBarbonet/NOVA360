import corpusJson from "../data/corpus.json";
import baselineJson from "../data/memory/baseline.json";
import type { Corpus, Memory, Source, Update } from "./types";
import { applyUpdates } from "./merge";

export { applyUpdates };

export const corpus = corpusJson as unknown as Corpus;
export const baseline = baselineJson as unknown as Memory;

// Mises à jour post-baseline : un fichier JSON par événement, trié par version (U1, U2…)
const updateModules = import.meta.glob("../data/memory/updates/*.json", { eager: true, import: "default" });
export const updates: Update[] = Object.values(updateModules as Record<string, Update>).sort((a, b) =>
  a.version.localeCompare(b.version, undefined, { numeric: true }),
);

const sourceIndex = new Map(corpus.sources.map((s) => [s.id, s]));
export const getSource = (id: string): Source | undefined => sourceIndex.get(id);

/** Mémoire à une version donnée : baseline + mises à jour successives jusqu'à `version` incluse. */
export const memoryAt = (version: string): Memory => applyUpdates(baseline, updates, version);

export const versions = (): { id: string; label: string }[] => [
  { id: "baseline", label: baseline.label },
  ...updates.map((u) => ({ id: u.version, label: u.label })),
];
