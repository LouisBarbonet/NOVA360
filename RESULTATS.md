# Résultats finaux — NOVA 360

> Tous les résultats sont consultables **directement sur GitHub, sans exécuter de code**. Fichier généré par `npm run package` à partir de la mémoire validée (chaque citation est vérifiée contre le corpus).
> Application en ligne (optionnelle) : https://louisbarbonet.github.io/NOVA360/ · Export hors ligne : [NOVA360_remise.zip](NOVA360_remise.zip) (ouvrir `dist/index.html`).

## Livrables par version (le baseline est conservé)

| Version | État | Fichiers |
|---|---|---|
| **baseline** | Baseline — état au 30 septembre 2026, 09:00 (Montréal) | [Brief (PDF)](livrables/baseline/1_BRIEF.pdf) · [Brief](livrables/baseline/1_BRIEF.md) · [Q01–Q10](livrables/baseline/2_REPONSES_Q01-Q10.md) · [Mémoire](livrables/baseline/3_MEMOIRE.md) · [Dossier de décisions](livrables/baseline/4_DOSSIER_DECISIONS.md) |

- **Mode d'emploi** (ouverture, navigation, outils, étapes manuelles, limites) : [MODE_EMPLOI.md](MODE_EMPLOI.md)
- **Captures de l'application** : [devpost/captures/](devpost/captures/)
- **Répétitions de mise à jour** (tests d'événements simulés) : [repetitions/README.md](repetitions/README.md)

## Réponses aux dix questions — Baseline — état au 30 septembre 2026, 09:00 (Montréal)

Réponse courte et preuves principales ; le détail, toutes les preuves et leurs extraits exacts sont dans [2_REPONSES_Q01-Q10.md](livrables/baseline/2_REPONSES_Q01-Q10.md).

| # | Question | Réponse | Preuves principales |
|---|---|---|---|
| Q01 | Quelle est la date de mise en production actuellement approuvée, et avec quelle réserve? | Le 22 octobre 2026. Ce n'est pas un go garanti : la date est conditionnelle à trois éléments (validation sécurité de SEC-210, fermeture d'ACC-303, approbation du runbook avec retour arrière). | `M04` L17-L23 · `M06` L11-L16 · `E09` L3-L7 |
| Q02 | Pourquoi la date a-t-elle changé, et quel est l'état actuel de la cause initiale? | À cause du connecteur interne (INT-101), qui était sur le chemin critique. Cette cause est résolue : INT-101 est fermé depuis le 17 sept. | `E05` L3-L5 · `M04` L9 · `INT-101` L17-L20 |
| Q03 | Qui a approuvé le changement et quand? Distinguez proposition et approbation. | Proposition : Boréal (Julien Moreau), le 8 sept. Approbation : le comité de direction, le 10 sept. 2026 vers 15:25. | `E05` L5-L7 · `M04` L17-L23 · `Teams_15sept_ProjetNOVA` L5 |
| Q04 | Qui est responsable du projet et depuis quand? | Nicolas Perron, depuis le 16 septembre 2026. Avant lui : Élodie Caron, depuis le 7 juillet. | `E06` L3-L5 · `Note_transition_Elodie_16sept` L4 · `Teams_16sept_Transition` L4-L5 |
| Q05 | Quel est le montant contractuel autorisé et comment se calcule-t-il? | 204 000 $ CAD (hors taxes) = 180 000 $ (contrat initial) + 24 000 $ (CR-01 approuvé). CR-04 (18 000 $) n'est pas inclus. | `CONTRAT_Boreal_NOVA` p.1 · `CR-01_Rapports_avances_APPROUVE` p.1 · `CR-04_Optimisation_mobile_BROUILLON` p.1 |
| Q06 | Quel problème présente INV-003? Précisez le montant concerné et le traitement à prévoir. | INV-003 (54 000 $) contient une ligne de 18 000 $ « Optimisation interface mobile - CR-04 ». CR-04 n'est pas approuvé : seuls les 36 000 $ du jalon 3 sont admissibles. | `INV-003` p.1 · `E07` L5 · `CR-04_Optimisation_mobile_BROUILLON` p.1 |
| Q07 | Où les données de production doivent-elles être hébergées? Quelle preuve confirme la mise en œuvre? | Au Canada, dans la région Canada Central (ADR-007, 23 juillet). Mise en œuvre : déclarée par Boréal le 26 août, puis vérifiée par l'équipe architecture (comité du 27 août). | `ADR-007_Localisation_donnees` L3-L15 · `M02` L11-L17 · `E03` L3-L5 |
| Q08 | La sécurité est-elle acceptée? Distinguez livraison et validation. | Non. Le correctif SEC-210 a été LIVRÉ le 19 sept., mais il n'est pas VALIDÉ : la sécurité n'a pas donné son acceptation et le ticket reste EN VALIDATION. | `SEC-210` L23-L25 · `E08` L3 · `M06` L6-L7 |
| Q09 | L'accessibilité est-elle complétée? Identifiez ce qui reste à corriger. | Non. ACC-301 et ACC-302 sont fermés, mais ACC-303 est OUVERT (priorité Haute, bloquant) : dans la modale « Modifier le dossier », la touche Tab n'atteint jamais le bouton Enregistrer. | `ACC-301` L16 · `ACC-302` L16 · `ACC-303` L14-L16 |
| Q10 | Quelles sont les trois conditions de go-live? Précisez les travaux manquants du runbook à partir de sa capture. | (1) Validation sécurité de SEC-210, (2) fermeture d'ACC-303, (3) approbation du runbook incluant le retour arrière. Selon la capture, il manque l'étape 4 « Procédure de retour arrière » (TODO) et l'étape 5 « Validation fonctionnelle post-déploiement » (À compléter). | `M06` L11-L14 · `OPS-601_runbook` capture · `OPS-601` L14-L16 |

## En chiffres

64 fichiers sources · 35 événements datés · 7 décisions · 8 contradictions résolues · 13 actions (5 engagements documentés, 8 recommandations de l'équipe) · 8 informations manquantes déclarées.
