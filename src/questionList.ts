// Questions proposées dans le chat (sans dépendance Vite : utilisées aussi par scripts/precompute.ts).

export const EXAMPLE_QUESTIONS = [
  "Quelle est la date de livraison actuellement prévue et pourquoi?",
  "Quelles décisions ont été prises concernant le fournisseur?",
  "Quels engagements ne sont toujours pas complétés?",
  "Existe-t-il des informations contradictoires?",
  "Quels sont les trois principaux risques du projet aujourd'hui?",
  "Pourquoi la décision Canada Central a-t-elle été prise?",
  "Qu'est-ce qui a changé depuis la semaine dernière?",
  "Si je devais reprendre le projet demain matin, que devrais-je savoir?",
];

/** Questions pièges : vérifient que le chat n'invente ni approbation ni échéance. */
export const TRAP_QUESTIONS = [
  "Le 22 octobre est-il garanti?",
  "SEC-210 est-il fermé?",
  "Qui a approuvé CR-04?",
  "Quelle est la date du re-test de SEC-210?",
];
