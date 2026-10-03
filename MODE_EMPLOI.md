# Mode d'emploi — NOVA 360

Mémoire opérationnelle du projet NOVA, établie à partir des 64 fichiers du corpus. État de référence : **30 septembre 2026, 09:00 (Montréal)**.

## Ouvrir le rendu

- **En ligne (jury, recommandé)** : **https://louisbarbonet.github.io/NOVA360/**. Aucune installation ni aucun compte. Tout fonctionne, chat compris.
  - Les **questions d'exemple** et quelques **questions pièges** ont une réponse pré-enregistrée : affichage instantané, mention 📌.
  - Les **questions libres** passent par un relais Cloudflare Worker, qui garde la clé Gemini secrète (elle n'est jamais envoyée au navigateur). Limites : 6 questions par minute et par visiteur, 150 questions libres par jour au total. Les questions déjà posées sont servies depuis le cache (mention ⚡) et ne comptent pas.
  - Si Gemini est surchargé ou si le quota est atteint, un message l'indique ; les réponses pré-enregistrées et toutes les autres pages restent disponibles.
  - L'intégration d'un nouvel événement n'est pas exposée en ligne : elle se fait sur le poste de l'équipe, puis la nouvelle version est publiée.
- **Sans connexion** : ouvrir `dist/index.html` (dans `NOVA360_remise.zip`). Tout fonctionne hors ligne, sauf les questions libres du chat ; les réponses pré-enregistrées restent disponibles.
- **Mode complet (démo)** : `npm install`, copier `.env.example` en `.env` et y mettre une clé API, puis `npm run dev` et ouvrir http://localhost:5173.
  - **Claude (par défaut)** : `ANTHROPIC_API_KEY` (console.anthropic.com, crédits prépayés).
  - **Gemini (secours gratuit)** : `NOVA_PROVIDER=gemini` et `GEMINI_API_KEY` (aistudio.google.com). Les quotas gratuits sont bas : l'app affiche un message clair quand ils sont atteints. `npm run gemini:models` liste les modèles disponibles pour `GEMINI_MODEL`.
  - Le `.env` est relu à chaque question : on peut changer de modèle ou de fournisseur sans redémarrer.
  - **Cache des réponses** : une question identique (casse, espaces et ponctuation ignorés), posée sur la même version de la mémoire, est servie depuis `.cache/llm/` sans consommer de quota (indicateur ⚡ dans le chat). Une mise à jour de la mémoire invalide le cache. `npm run cache:clear` le vide. Les analyses d'impact ne sont pas mises en cache, pour pouvoir relancer un brouillon.

- **Livrables hors application** : `livrables/<version>/` contient le brief (Markdown + PDF d'une page), les réponses Q01–Q10 avec extraits, la mémoire et le dossier de décisions. On les régénère avec `npm run export` ; `npm run package` refait en plus le zip de remise `NOVA360_remise.zip`.

## Naviguer

- **Brief de reprise** : une page imprimable avec responsable, date et conditions, portée, budget, factures et priorités. Les trois conditions de go-live y sont reliées à leurs actions, responsables et échéances.
- **Q01–Q10** : réponse courte, puis détail et nuances. Chaque réponse cite des preuves.
- **Preuves** : chaque étiquette bleue (ex. `M04 L17-L23`) ouvre le fichier source avec le passage **surligné**. Les repères possibles sont une ligne (L), une page PDF (p.), une cellule Excel (`Plan projet!E7`) ou une capture.
- **Dossier de décisions** : pour chaque décision, qui l'a proposée et qui l'a prise, pourquoi, puis la chaîne des faits avec l'extrait exact de chaque preuve.
- **Chronologie** : filtrable par type (proposition, décision, livraison, validation, risque, fait) et par sujet.
- **Contradictions** : chaque conflit est tranché par l'autorité de la source ou la date des faits.
- **Actions et risques** : filtre « engagement documenté » ou « recommandation de notre équipe » ; liste des informations manquantes.
- **Sources** : le corpus complet. Les doublons, le bruit et l'historique sont signalés par ⚠.
- **Recherche** : recherche plein texte tolérante aux accents et aux fautes.
- **Version** (en haut) : bascule entre le baseline et chaque mise à jour. Les éléments modifiés sont encadrés en violet.

## Intégrer un nouvel événement

1. Page **Mise à jour** : coller le texte de l'événement, ou déposer le fichier dans `NOVA_ETUDIANTS/Projet360_NOVA_ETUDIANTS/09_Nouvel_evenement/`.
2. L'événement est extrait comme une nouvelle source, puis le LLM rédige un **brouillon** : ce qui change (avant/après), ce qui est affecté, ce qui ne change pas, et les actions à prendre.
3. L'équipe **relit et corrige** le JSON (aucune approbation inventée, aucune autre condition fermée), puis l'enregistre comme `data/memory/updates/U<n>.json`.
4. Le **baseline n'est jamais modifié**. Le sélecteur de version permet de comparer l'avant et l'après.

## Outils utilisés

- **Claude Code (Claude Opus 5.5)** : lecture du corpus, transcription des 8 captures d'écran, rédaction de la mémoire de référence, développement.
- **Claude Haiku 4.5** (API, configurable via `NOVA_MODEL`) : chat en langage naturel. Le corpus complet et la mémoire sont envoyés en contexte avec mise en cache ; il n'y a pas de base vectorielle.
- **Claude Sonnet 5.5** (configurable via `NOVA_IMPACT_MODEL`) : brouillon d'analyse d'impact d'un nouvel événement.
- **Google Gemini Flash** (secours, palier gratuit, `NOVA_PROVIDER=gemini`) : même rôle que Claude pour le chat et l'impact, sans mise en cache ; le corpus est renvoyé à chaque question.
- **unpdf** (PDF), **SheetJS/xlsx** (Excel), décodeur MIME maison (courriels), **MiniSearch** (recherche), **Vite + TypeScript** (application).

## Traitements manuels

- **Transcription des captures** (`data/transcriptions/`) : faite par lecture d'image, puis relue. Elle est signalée « transcription manuelle » dans la visionneuse.
- **Curation de la mémoire** (`data/memory/baseline.json`) : rédigée avec Claude, puis relue par l'équipe contre les sources.
- **Contrôles automatiques** : `npm run validate` vérifie que chacune des citations pointe vers un passage réel du corpus ; `npm test` vérifie le rendu de toutes les pages et la cohérence des montants.

## Limites et informations incertaines

- Les **échéances** des trois conditions de go-live ne sont pas documentées : date du re-test SEC-210, date de la « prochaine build » ACC-303, date du runbook final. Elles sont indiquées « à confirmer ».
- L'acceptation du **jalon 3** d'INV-003 (36 000 $) n'est pas prouvée dans le corpus.
- La migration Canada Central est confirmée par un compte rendu de comité (M03), pas par une preuve technique brute.
- Aucune instance **go/no-go** n'est planifiée, et aucun plan n'est prévu si la date dépasse la fin du contrat (31 oct.).
- Les **recommandations de notre équipe** (responsable « proposé ») ne sont pas des engagements : elles sont distinguées partout.
- Le **chat** peut se tromper ou mal citer : vérifier chaque preuve. Sur le palier gratuit de Gemini, les quotas (quelques dizaines de requêtes par jour) peuvent bloquer temporairement le chat. Les réponses Q01–Q10 de la page dédiée sont celles qui ont été relues et validées.
- Les dates de fichiers ne sont pas fiables (README, règles de lecture) : seules la date et l'autorité du contenu comptent.
