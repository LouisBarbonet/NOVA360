# NOVA 360 — mémoire opérationnelle du projet NOVA

Défi Loto-Québec « Projet 360 / NOVA ». C'est une mémoire consultable et sourcée de l'état du projet au **30 septembre 2026, 09:00**, que l'on peut mettre à jour sans effacer le baseline.

## Livrables (remise Devpost)

| Livrable | Où le trouver |
|---|---|
| Brief de reprise (1 page) | `livrables/baseline/1_BRIEF.pdf` et `.md` · app : *Brief de reprise* |
| Réponses Q01–Q10 sourcées (fichier + repère + extrait) | `livrables/baseline/2_REPONSES_Q01-Q10.md` · app : *Q01–Q10* |
| Mémoire : chronologie, décisions, contradictions résolues, actions, risques, sources | `livrables/baseline/3_MEMOIRE.md` · app : toutes les pages |
| Dossier de décisions et preuves (bonus) | `livrables/baseline/4_DOSSIER_DECISIONS.md` · app : *Dossier de décisions* |
| État après la nouvelle information | `livrables/U<n>/` (avec `5_MISE_A_JOUR.md`) · app : *Mise à jour* + sélecteur de version |
| Mode d'emploi | [`MODE_EMPLOI.md`](MODE_EMPLOI.md) |

## Démarrage rapide

- **Jury, sans installation :** ouvrir `dist/index.html` (export autonome, hors ligne, aucun abonnement requis).
- **Équipe :** `npm install`, puis `npm run dev`. Le chat et l'intégration d'événements demandent une clé dans `.env` (voir `.env.example`) : Claude par défaut, ou Gemini gratuit en secours avec `NOVA_PROVIDER=gemini`.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run extract` | Extrait le corpus (`NOVA_ETUDIANTS/`) vers `data/corpus.json`, avec ses repères |
| `npm run validate` | Vérifie que chaque citation de la mémoire pointe vers un passage réel |
| `npm test` | Rendu de toutes les pages, surlignage des preuves, montants, superposition des mises à jour |
| `npm run export` | Construit `dist/` et régénère `livrables/` (Markdown + PDF du brief, par version) |
| `npm run gemini:models` | Liste les modèles Gemini accessibles avec la clé (pour régler `GEMINI_MODEL`) |
