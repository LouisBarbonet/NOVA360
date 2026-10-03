export type Cite = { s: string; r: string; q?: string };
export type Segment = { ref: string; text: string };
export type Source = {
  id: string;
  path: string;
  folder: string;
  kind: string;
  ext: string;
  title: string;
  meta: Record<string, string>;
  attachments: { filename: string; duplicateOf?: string }[];
  segments: Segment[];
  transcription?: string;
};
export type Corpus = { generatedAt: string; sources: Source[] };

export type Level = "ok" | "warn" | "bad" | "info";
export type Topic = { id: string; title: string; level: Level; status: string; summary: string; sources: Cite[] };
export type TimelineEvent = { date: string; type: string; topic: string; title: string; sources: Cite[] };
export type Decision = { id: string; topic?: string; date: string; title: string; by: string; proposedBy?: string; status: string; replacedBy?: string; why: string; sources: Cite[] };
export type GoLive = { id: string; title: string; approver: string; status: string; level: Level; actions: string[]; sources: Cite[] };
export type Action = {
  id: string; title: string; owner: string; ownerStatus: string; due: string;
  origin: string; condition?: string; status: string; sources: Cite[];
};
export type Risk = { id: string; rank: number; title: string; level: string; why: string; mitigation: string; sources: Cite[] };
export type Claim = { text: string; verdict: string; sources: Cite[] };
export type Contradiction = { id: string; topic: string; title: string; claims: Claim[]; resolution: string; basis: string; sources?: Cite[]; action?: string };
export type Answer = { id: string; question: string; short: string; detail: string; sources: Cite[] };
export type Invoice = { id: string; date: string; status: string; lines: { label: string; amount: number; flag?: string }[]; total: number; flag: string | null; sources: Cite[] };
export type Memory = {
  version: string;
  label: string;
  asOf: string;
  curation?: string;
  people: { name: string; role: string; org: string; sources: Cite[] }[];
  topics: Topic[];
  timeline: TimelineEvent[];
  decisions: Decision[];
  goLiveConditions: GoLive[];
  actions: Action[];
  risks: Risk[];
  contradictions: Contradiction[];
  finances: {
    authorized: { label: string; amount: number; sources: Cite[] }[];
    notAuthorized: { label: string; amount: number; sources: Cite[] }[];
    invoices: Invoice[];
    excluded: { id: string; reason: string; amount: number; sources: Cite[] }[];
  };
  missing: { title: string; detail: string; sources: Cite[] }[];
  noise: { s: string; reason: string }[];
  answers: Answer[];
  brief: { title: string; sections: { theme: string; text: string; sources: Cite[] }[] };
  /** Identifiants des éléments modifiés par la mise à jour appliquée (pour surlignage). */
  changed?: Set<string>;
};

/** Mise à jour superposée au baseline : le baseline n'est jamais réécrit. */
export type Update = {
  version: string;
  label: string;
  asOf: string;
  event: { title: string; summary: string; sources: Cite[] };
  changes: { what: string; before: string; after: string; sources: Cite[] }[];
  affected: { ref: string; impact: string; sources: Cite[] }[];
  unchanged?: { ref: string; why: string; sources: Cite[] }[];
  /** Éléments remplacés/ajoutés, fusionnés par id dans la mémoire du baseline. */
  patch: Partial<Record<"topics" | "decisions" | "goLiveConditions" | "actions" | "risks" | "contradictions" | "answers" | "missing", { id?: string; title?: string }[]>> & {
    timeline?: TimelineEvent[];
    brief?: Memory["brief"];
  };
};

/** Réponses du chat générées à l'avance (scripts/precompute.ts), servies sans appel réseau. */
export type Precomputed = {
  generatedAt: string;
  provider: string;
  entries: { version: string; question: string; answer: string; model: string }[];
};
