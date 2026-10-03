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
