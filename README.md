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

- **Jury, en ligne :** **https://louisbarbonet.github.io/NOVA360/**. Aucune installation, chat compris (clé gardée secrète par un relais Cloudflare, quotas limités ; voir le mode d'emploi).
- **Jury, hors ligne :** ouvrir `dist/index.html` (export autonome dans `NOVA360_remise.zip`, aucun abonnement requis).
- **Équipe :** `npm install`, puis `npm run dev`. Le chat et l'intégration d'événements demandent une clé dans `.env` (voir `.env.example`) : Claude par défaut, ou Gemini gratuit en secours avec `NOVA_PROVIDER=gemini`.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run extract` | Extrait le corpus (`NOVA_ETUDIANTS/`) vers `data/corpus.json`, avec ses repères |
| `npm run validate` | Vérifie que chaque citation de la mémoire pointe vers un passage réel |
| `npm test` | Rendu de toutes les pages, surlignage des preuves, montants, superposition des mises à jour |
| `npm run export` | Construit `dist/` et régénère `livrables/` (Markdown + PDF du brief, par version) |
| `npm run gemini:models` | Liste les modèles Gemini accessibles avec la clé (pour régler `GEMINI_MODEL`) |
| `npm run package` | Refait l'export puis `NOVA360_remise.zip` (app autonome + livrables + mode d'emploi), avec contrôle anti-clé API |
| `npm run cache:clear` | Vide le cache des réponses du chat (`.cache/llm/`) |
| `npm run precompute` | Pré-enregistre les réponses aux questions d'exemple et aux questions pièges (`data/precomputed/`, à relire) |
| `npm run worker:deploy` | Redéploie le relais Cloudflare du chat avec la mémoire à jour (après un nouvel événement) |
