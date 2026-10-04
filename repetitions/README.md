# Répétitions de l'arrivée d'un nouvel événement

Ces fichiers ne sont **pas chargés par l'application**. Ils documentent les tests du flux de mise à jour, faits avant la finale.

## Répétition 1 — courriel simulé de Boréal (1er oct. 2026), analyse par Gemini

- **Événement inventé par l'équipe** (`EVT-01_courriel_simule.txt`) : build livrée avec le correctif ACC-303, runbook repoussé au 14 oct., proposition de report au 29 oct.
- **Pièges testés** : livraison ≠ validation (ACC-303), proposition ≠ décision (29 oct.), ne rien fermer d'autre (SEC-210).
- **1er essai** : JSON invalide (clé sans guillemets) ; patch recopiant tous les éléments ; erreur de date (« le 29 oct. dépasse le 31 oct. »). Corrections : mode JSON natif de Gemini, réparation tolérante, retrait automatique des éléments inchangés, consigne de vérifier les dates.
- **2e essai** : patch ciblé (GL-2, GL-3, A-02/03/04, nouvelle A-14 « trancher sur le 29 oct. », RK-1, Q01/Q09/Q10), calculs de jours exacts, SEC-210 déclaré inchangé.
- **Relecture humaine** : GL-1 retiré du patch (déclaré « inchangé » mais reformulé par le modèle).
- **Résultat** (`U1_gemini_courriel_boreal_1er_oct.json`) : 57 citations validées, baseline intact, brief U1 sur une page avec encadré des changements.
- Durée : environ 1 minute d'analyse (Gemini Flash surchargé, réponse par Flash-Lite), puis 2 minutes de relecture.

## Répétition 2 — courriel avec pièces jointes (capture + PDF), téléversé, analysé par Gemini

- **Événement inventé** (`repetition-2/Courriel_Olivier_runbook.eml`) : Olivier transmet le runbook final reçu de Boréal (capture d'écran + annexe A en PDF, absentes du corpus), mais précise que ce n'est **pas encore une approbation** (test par son équipe d'ici le 6 oct.).
- **Pièges testés** : pièces jointes nouvelles dans un courriel ; capture à transcrire ; livré ≠ approuvé (GL-3 doit rester ouvert) ; ne rien fermer d'autre.
- **Ingestion** : courriel (13 segments), capture transcrite automatiquement par le LLM (8 lignes, fidèle à l'image, marquée « à relire » : `transcription_automatique_PJ1.txt`), PDF extrait.
- **Incidents réels** : quota quotidien du modèle principal épuisé (20 requêtes/jour/modèle) → ajout d'une échelle de modèles de repli ; JSON invalide (guillemet manquant) malgré le mode JSON → réparation avec `jsonrepair` ; éléments reformulés sans raison → garde-fous (un élément modifié doit citer la nouvelle source ; un élément déclaré inchangé ne peut pas être modifié).
- **Résultat** (`U1_gemini_runbook_recu.json`) : patch limité à runbook, GL-3, A-04, A-05 (échéance du 6 oct. documentée par Olivier), Q10, RK-1, RK-2 ; brief révisé (thèmes « Date approuvée et conditions » et « Priorités ») ; 50 citations validées ; GL-1 et GL-2 inchangés ; brief U1 sur une page.
