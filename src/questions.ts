// Questions proposées dans le chat ; ce sont aussi celles dont la réponse est pré-enregistrée (scripts/precompute.ts).
import { normalize } from "../server/prompt";
import type { Precomputed } from "./types";

export { EXAMPLE_QUESTIONS, TRAP_QUESTIONS } from "./questionList";

// Réponses pré-enregistrées : un fichier JSON par génération (absent tant que precompute n'a pas tourné)
const files = import.meta.glob("../data/precomputed/*.json", { eager: true, import: "default" }) as Record<string, Precomputed>;
const index = new Map<string, Precomputed["entries"][number]>();
for (const file of Object.values(files)) for (const e of file.entries) index.set(`${e.version}|${normalize(e.question)}`, e);

/** Réponse pré-enregistrée pour une première question (sans historique), ou undefined. */
export const precomputedAnswer = (version: string, question: string) => index.get(`${version}|${normalize(question)}`);
