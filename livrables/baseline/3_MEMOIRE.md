# Mémoire du projet NOVA — Baseline — état au 30 septembre 2026, 09:00 (Montréal)

Mémoire rédigée avec Claude Code (Claude Opus) à partir de public/data/corpus.json, puis relue par l'équipe. Chaque élément cite un fichier et un repère (ligne L, page p., cellule, commentaire daté ou capture).

## Personnes et rôles

| Nom | Rôle | Organisation | Preuves |
|---|---|---|---|
| Nicolas Perron | Chargé de projet NOVA (depuis le 16 sept. 2026) | Organisation Démo | `E06 L3`, `Note_transition_Elodie_16sept L4` |
| Élodie Caron | Chargée de projet du 7 juillet au 16 sept. 2026, puis soutien à la transition | Organisation Démo | `M01 L9`, `E06 L5` |
| Sophie Lambert | Sécurité — accepte ou refuse SEC-210 | Organisation Démo | `M02 L3`, `SEC-210 L24` |
| Mélissa Gagnon | Accessibilité / QA — responsable des tests intégrés (P-04) | Organisation Démo | `ACC-303 L4`, `Plan_Projet_NOVA_v3_12sept Plan projet!D5` |
| Olivier Côté | Exploitation — donne le go exploitation (runbook) | Organisation Démo | `M06 L10`, `OPS-601 L4` |
| Marc Gervais | Architecture et intégration (connecteur interne, INT-101) | Organisation Démo | `M02 L3`, `INT-101 L4` |
| Camille Beaulieu | Migration de données (DATA-401) | Organisation Démo | `DATA-401 L4` |
| Amélie Fortin | Finances — valide les factures | Organisation Démo | `E07 L3` |
| Alex Deschamps | Communications | Organisation Démo | `E11 L3` |
| Julien Moreau | Représentant du fournisseur | Boréal Numérique | `E05 De` |

## Chronologie

Types : **proposition** (suggérée), **décision** (prise par l'autorité), **livraison** (annoncée par le fournisseur), **validation** (acceptée par le responsable), risque, fait.

| Date | Type | Événement | Preuves |
|---|---|---|---|
| 2026-07-07 | décision | Démarrage : budget 180 000 $, cible 15 oct., Élodie chargée de projet | `M01 L8-L12`, `Charte_Projet_NOVA_v1 L4-L7`, `E01 L5` |
| 2026-07-18 | fait | Architecture v1 : données en East US | `Architecture_NOVA_v1 p.1` |
| 2026-07-22 | risque | Sophie Lambert exige que les données de production restent au Canada | `E02 L3-L5` |
| 2026-07-23 | décision | Atelier architecture : Canada Central, SSO seulement, audit admin à valider | `M02 L13-L17`, `M02 L30`, `ADR-007_Localisation_donnees L3-L4` |
| 2026-08-14 | décision | CR-01 (rapports avancés, 24 000 $) APPROUVÉ par le comité de projet | `CR-01_Rapports_avances_APPROUVE p.1` |
| 2026-08-15 | validation | ACC-301 (libellés) validé et fermé par Mélissa | `ACC-301 L16` |
| 2026-08-20 | validation | ACC-302 (contraste 5,3:1) validé et fermé | `ACC-302 L16` |
| 2026-08-20 | livraison | Boréal : « tout devrait être conforme » (libellés et contraste seulement) | `E04 L3` |
| 2026-08-26 | livraison | Boréal déclare la migration vers Canada Central complétée (schéma v2) | `E03 L3-L5`, `Architecture_NOVA_v2 p.1` |
| 2026-08-27 | validation | Comité : migration Canada Central vérifiée par l'équipe architecture | `M03 L5` |
| 2026-09-02 | risque | DATA-401 : doublons dans le lot de migration MIG-09-02 | `DATA-401 L1-L3`, `DATA-401_doublons capture` |
| 2026-09-04 | proposition | Boréal soumet CR-04 (mobile avancé, 18 000 $) — brouillon | `CR-04_Optimisation_mobile_BROUILLON p.1` |
| 2026-09-05 | risque | INT-101 : les recherches via le connecteur retournent vide (401, jeton expiré) | `INT-101 L14-L15`, `INT-101_extrait_logs L1-L2` |
| 2026-09-07 | validation | PERF-501 fermé (620 ms en moyenne) | `PERF-501 L16` |
| 2026-09-08 | proposition | Boréal PROPOSE de reporter la mise en production au 22 oct. | `E05 L3-L7` |
| 2026-09-09 | validation | DATA-401 : rejeu de 15 000 événements sans doublon, ticket fermé | `DATA-401 L19` |
| 2026-09-10 | décision | Comité de direction : 22 oct. APPROUVÉ (formulé par Élodie, aucune objection) | `M04 L17-L23` |
| 2026-09-10 | décision | Mobile (≈ 18 000 $) : aucune décision de dépense | `M04 L33-L35` |
| 2026-09-12 | fait | Plan projet v3 publié, mais il affiche toujours le 15 oct. pour P-06 | `Plan_Projet_NOVA_v3_12sept Plan projet!E7` |
| 2026-09-12 | risque | SEC-210 ouvert : l'audit de l'export CSV est incomplet (bloquant avant production) | `SEC-210 L3-L5` |
| 2026-09-16 | décision | Nicolas Perron devient officiellement chargé de projet | `E06 L3`, `Note_transition_Elodie_16sept L4` |
| 2026-09-17 | validation | INT-101 validé (120/120) et fermé par Marc Gervais | `INT-101 L17-L18`, `E12 L3-L5` |
| 2026-09-17 | risque | ACC-303 ouvert : le bouton Enregistrer de la modale est inatteignable au clavier | `ACC-303 L3-L6`, `ACC-303 L14` |
| 2026-09-19 | livraison | Boréal livre le correctif SEC-210 en validation — non accepté par la sécurité | `E08 L3`, `SEC-210 L23-L24`, `Teams_19sept_Securite L5` |
| 2026-09-21 | fait | Rapport de statut « VERT » sur sécurité et accessibilité (prématuré) | `Rapport_Statut_21sept p.1` |
| 2026-09-22 | fait | INV-003 reçue : 54 000 $, dont 18 000 $ pour CR-04 | `INV-003 p.1` |
| 2026-09-23 | risque | Les Finances demandent l'approbation de CR-04 avant de libérer INV-003 | `E07 L3-L5` |
| 2026-09-24 | décision | Décision de portée : CR-04 reporté en phase 2, aucune dépense sans approbation | `Decision_Portee_Phase2 L3-L6`, `E10 L3-L5` |
| 2026-09-25 | risque | OPS-601 : runbook pas prêt (retour arrière TODO) | `OPS-601 L3-L14`, `OPS-601_runbook capture` |
| 2026-09-26 | fait | Comité : fix SEC-210 livré mais acceptation sécurité NON donnée ; re-test planifié, statut maintenu EN VALIDATION | `M06 L6-L7`, `SEC-210 L25` |
| 2026-09-26 | fait | ACC-303 toujours ouvert, jugé bloquant avant production ; correctif annoncé pour la prochaine build | `ACC-303 L16`, `M06 L9`, `M06 L15` |
| 2026-09-26 | décision | Comité : le 22 oct. reste la cible, CONDITIONNELLE à trois éléments | `M06 L11-L16` |
| 2026-09-27 | fait | Rappel de Nicolas : ne pas communiquer le 22 comme un go garanti | `E09 L3-L7` |
| 2026-09-29 | fait | Olivier : toujours pas de version finale du runbook | `OPS-601 L16` |
| 2026-09-29 | fait | Registre des risques publié : R-01 (connecteur) toujours « Ouvert » (non mis à jour) | `Registre_Risques_29sept Risques!F2`, `Registre_Risques_29sept Risques!H2` |

## Décisions

### D-01 — Lancement : budget maximal 180 000 $, cible 15 oct., portée phase 1 (2026-07-07)

- **Décidé par :** Rencontre de démarrage
- **Statut :** partiellement remplacée (remplacée en partie par D-04 (date), D-05 (responsable))
- **Pourquoi :** Point de départ du projet.
- **Preuves :** `M01 L8-L12`, `Charte_Projet_NOVA_v1 L20`

### D-02 — Données de production au Canada — Canada Central (ADR-007) (2026-07-23)

- **Décidé par :** Atelier architecture : Élodie, Marc, Sophie, Julien
- **Statut :** en vigueur
- **Pourquoi :** Exigence de la sécurité : les données de production NOVA doivent demeurer au Canada. L'architecture v1 (East US) est remplacée.
- **Preuves :** `M02 L11-L17`, `ADR-007_Localisation_donnees L7-L10`

### D-03 — CR-01 approuvé : rapports avancés et export de synthèse (+24 000 $) (2026-08-14)

- **Décidé par :** Comité de projet
- **Statut :** en vigueur
- **Pourquoi :** Ajout de portée approuvé par écrit, comme l'exige le contrat.
- **Preuves :** `CR-01_Rapports_avances_APPROUVE p.1`, `CONTRAT_Boreal_NOVA p.1`

### D-04 — Mise en production reportée du 15 au 22 oct. 2026 (2026-09-10)

- **Décidé par :** Comité de direction — décision formulée par Élodie Caron, sans objection de Sophie, Marc, Olivier et Nicolas
- **Proposé par :** Boréal (Julien Moreau), le 8 sept.
- **Statut :** en vigueur, conditionnelle
- **Pourquoi :** Le connecteur interne (INT-101) était sur le chemin critique. La semaine de plus sert à stabiliser, à reprendre les tests intégrés et à éviter de compresser les tests de sécurité et d'accessibilité. Pas de pénalité contractuelle (contrat jusqu'à fin octobre).
- **Preuves :** `E05 L5-L7`, `M04 L6-L23`

### D-05 — Nicolas Perron reprend la charge du projet (2026-09-16)

- **Décidé par :** Élodie Caron (« comme convenu »)
- **Statut :** en vigueur
- **Pourquoi :** Transition de la charge de projet.
- **Preuves :** `E06 L3-L5`, `Teams_16sept_Transition L4-L5`

### D-06 — Optimisations mobiles avancées (CR-04) reportées en phase 2 (2026-09-24)

- **Décidé par :** Nicolas Perron (chargé de projet)
- **Statut :** en vigueur
- **Pourquoi :** Hors de la portée approuvée de la phase 1 (charte, contrat). Le comité du 10 sept. n'avait pris aucune décision de dépense. La phase 1 doit rester utilisable sur mobile.
- **Preuves :** `Decision_Portee_Phase2 L3-L6`, `E10 L3-L5`, `M04 L33-L35`

### D-07 — Le 22 oct. est conditionné à trois éléments de go-live (2026-09-26)

- **Décidé par :** Comité de direction — Nicolas Perron, confirmé par Sophie, Mélissa et Olivier
- **Statut :** en vigueur
- **Pourquoi :** Validation sécurité de SEC-210, fermeture d'ACC-303 et approbation du runbook (incluant le retour arrière).
- **Preuves :** `M06 L11-L16`

## Contradictions résolues

### C-01 — Date de mise en production : 15 oct. dans les plans contre 22 oct. approuvé

- **[périmé]** Plan v3 (12 sept.) : P-06 Mise en production le 2026-10-15, « Cible de planification » — `Plan_Projet_NOVA_v3_12sept Plan projet!E7`, `Plan_Projet_NOVA_v3_12sept Plan projet!G7`
- **[historique]** Charte v1, E01, M01, plan v2, plan préliminaire de juin et notes personnelles : 15 oct. — `Charte_Projet_NOVA_v1 L7`, `Plan_Projet_NOVA_v2 Plan projet!E7`, `Notes_personnelles_quelquun L3`
- **[retenu]** Comité de direction du 10 sept. : 22 oct. approuvé ; reconfirmé les 18, 26 et 27 sept. — `M04 L17-L23`, `M05 L13`, `M06 L16`, `E09 L3`

**Résolution (autorité + date) :** On retient le 22 octobre. Raison d'autorité : c'est une décision formelle du comité de direction, alors qu'un plan est un document de travail. Raison de date : le plan v3 a été publié 2 jours après la décision sans être corrigé, ce que Nicolas confirme le 15 sept. (« Le plan projet n'a visiblement pas encore été corrigé »). La charte précise elle-même qu'elle n'est pas mise à jour après les décisions. — `Teams_15sept_ProjetNOVA L5`, `Charte_Projet_NOVA_v1 L20`

Action corrective : A-08

### C-02 — Registre des risques du 29 sept. : connecteur « Ouvert », alors qu'INT-101 est fermé depuis le 17 sept.

- **[périmé]** R-01 « Retard du connecteur interne », statut Ouvert, commentaire « Suivi au 9 septembre 2026 » — `Registre_Risques_29sept Risques!F2`, `Registre_Risques_29sept Risques!H2`
- **[retenu]** INT-101 validé (120/120) et fermé le 17 sept. par Marc Gervais, propriétaire de R-01 ; journal 200 OK le 17 sept. — `INT-101 L17-L18`, `INT-101_extrait_logs L3`, `E12 L5`, `M05 L6`

**Résolution (date des faits + autorité) :** On retient INT-101 fermé. Raison de date des faits : le commentaire de R-01 date du 9 septembre ; la ligne n'a pas été rafraîchie, même si le fichier porte la date du 29 sept. Raison d'autorité : la fermeture vient du ticket et de son propriétaire. Note : Courriel_archive_17sept est une copie exacte d'E12 ; ce n'est pas une confirmation indépendante. — `Courriel_archive_17sept L5`

Action corrective : A-09

### C-03 — Rapport de statut « VERT » sur la sécurité et l'accessibilité contre les tickets ouverts

- **[non fiable]** Rapport du 21 sept. : Sécurité VERT (« Correctif SEC-210 livré »), Accessibilité VERT (« Correctifs appliqués ») — `Rapport_Statut_21sept p.1`
- **[non fiable]** Brouillon de communication : « La sécurité et l'accessibilité sont complétées » — `E11 L5`
- **[retenu]** SEC-210 EN VALIDATION (non accepté) ; ACC-303 OUVERT, bloquant (confirmé en comité le 26 sept.) — `SEC-210 L6`, `ACC-303 L6`, `M06 L7-L9`

**Résolution (autorité) :** Le rapport confond livraison et validation. Il précise lui-même avoir été « préparé avant la dernière vérification détaillée de certains tickets ». Les tickets, ainsi que les responsables sécurité et accessibilité en comité, font autorité. Le brouillon d'E11 s'appuie sur ce rapport et ne doit pas être diffusé tel quel. — `Rapport_Statut_21sept p.1`

Action corrective : A-10

### C-04 — SEC-210 « réglé » selon Boréal, « non accepté » selon la sécurité

- **[livraison seulement]** Boréal : « pour nous, le problème est corrigé », « SEC-210 devrait être good » — `E08 L3`, `Teams_19sept_Securite L4`, `SEC-210 L23`
- **[retenu]** Sophie : « déployé != accepté », ne pas fermer avant la validation sécurité — `Teams_19sept_Securite L5`, `SEC-210 L24-L25`, `M06 L7`

**Résolution (autorité) :** L'acceptation relève de l'équipe sécurité, pas du fournisseur. Le correctif est livré, mais la validation n'est pas faite.

### C-05 — « Tout devrait être conforme » (20 août) contre ACC-303 ouvert (17 sept.)

- **[partiel]** Boréal : corrections des libellés et du contraste, « tout devrait maintenant être conforme » — `E04 L3`
- **[retenu]** Mélissa voulait déjà repasser les modales au clavier ; ACC-303 a été ouvert le 17 sept. (build 2026.09.17) — `E04 L10`, `M03 L11`, `ACC-303 L3-L6`

**Résolution (date des faits) :** E04 ne couvrait que ACC-301 et ACC-302, qui ont bien été validés. Le scénario clavier des modales a été testé plus tard et a échoué. La date des faits tranche : ACC-303 est postérieur.

### C-06 — Mobile avancé : inclus selon Boréal (et facturé), hors portée selon le projet

- **[rejeté]** Julien : « Je pensais que le mobile était inclus dans le scope initial » ; INV-003 facture CR-04 — `Teams_22sept_Mobile L4`, `INV-003 p.1`
- **[retenu]** Charte et contrat : la portée phase 1 n'inclut pas le mobile avancé ; CR-04 est un BROUILLON ; il a été reporté en phase 2 le 24 sept. — `CONTRAT_Boreal_NOVA p.1`, `M01 L20`, `CR-04_Optimisation_mobile_BROUILLON p.1`, `Decision_Portee_Phase2 L4-L6`

**Résolution (autorité) :** La portée contractuelle et la décision du chargé de projet font autorité. La compatibilité mobile de base est incluse ; le package CR-04 à 18 000 $ ne l'est pas.

Action corrective : A-06

### C-07 — East US (architecture v1) contre Canada Central (ADR-007, v2)

- **[remplacé]** Architecture v1 du 18 juillet : données en East US — `Architecture_NOVA_v1 p.1`
- **[retenu]** ADR-007 accepté le 23 juillet ; architecture v2 du 25 août : Canada Central — `ADR-007_Localisation_donnees L10`, `Architecture_NOVA_v2 p.1`

**Résolution (date + autorité) :** L'ADR-007 déclare explicitement la v1 remplacée sur ce point. La raison est à la fois de date et d'autorité.

### C-08 — La charte nomme Élodie Caron chargée de projet, alors que c'est Nicolas Perron depuis le 16 sept.

- **[historique]** Charte v1 : « Chargée de projet : Élodie Caron » — `Charte_Projet_NOVA_v1 L4`
- **[retenu]** E06, note de transition, Teams 16 sept. : Nicolas Perron officiellement responsable — `E06 L3`, `Note_transition_Elodie_16sept L4`

**Résolution (date) :** La charte n'est pas mise à jour après les décisions (L20). La transition du 16 sept. est plus récente.

## Actions restantes

« Engagement documenté » = prévu dans le corpus ; « recommandation équipe » = proposition de notre équipe, non engagée par le projet.

| ID | Action | Responsable | Échéance | Origine | Statut | Preuves |
|---|---|---|---|---|---|---|
| A-01 (GL-1) | Faire le re-test sécurité de SEC-210 et rendre une décision d'acceptation écrite | Sophie Lambert (confirmé) | à confirmer (« re-test planifié », date non indiquée) | engagement documenté | en cours | `SEC-210 L24-L25`, `M06 L7` |
| A-02 (GL-2) | Livrer le correctif ACC-303 dans la prochaine build | Boréal (Julien Moreau) (confirmé) | à confirmer (« prochaine build ») | engagement documenté | à faire | `M06 L15`, `ACC-303 L16` |
| A-03 (GL-2) | Re-tester ACC-303 au clavier (Chrome et Edge) et fermer le ticket si c'est conforme | Mélissa Gagnon (proposé) | à confirmer (dépend de A-02) | recommandation équipe | à faire | `ACC-303 L14`, `M06 L9` |
| A-04 (GL-3) | Compléter le runbook : étape 4 (retour arrière) et étape 5 (validation fonctionnelle post-déploiement) | Boréal (équipe ops, relancée par Julien Moreau) (confirmé) | à confirmer — Olivier veut le runbook final « quelques jours avant » ; le plan v3 fait finir P-05 le 10 oct. | engagement documenté | en retard (rien reçu au 29 sept.) | `M06 L15`, `OPS-601_runbook capture`, `M04 L12`, `Plan_Projet_NOVA_v3_12sept Plan projet!F6` |
| A-05 (GL-3) | Approuver le runbook une fois qu'une autre personne peut l'exécuter sans l'équipe projet | Olivier Côté (confirmé) | à confirmer | engagement documenté | à faire | `OPS-601 L14`, `M06 L10` |
| A-06 | Répondre aux Finances : CR-04 n'est pas approuvé ; ne pas libérer la ligne de 18 000 $ d'INV-003 | Nicolas Perron (proposé) | à confirmer (question en attente depuis le 23 sept.) | recommandation équipe | à faire | `E07 L5`, `Decision_Portee_Phase2 L6` |
| A-07 | Demander à Boréal une facture corrigée ou une note de crédit de 18 000 $ ; traiter seulement le jalon 3 (36 000 $) après vérification du livrable | Amélie Fortin (Finances) avec Nicolas Perron (proposé) | à confirmer | recommandation équipe | à faire | `INV-003 p.1`, `CONTRAT_Boreal_NOVA p.1` |
| A-08 | Mettre la date à jour dans tous les plans (P-06 → 22 oct.) | Nicolas Perron (confirmé) | à confirmer (demandé dès le 10 sept., toujours pas fait dans le plan v3) | engagement documenté | en retard | `M04 L23`, `Note_transition_Elodie_16sept L7`, `Plan_Projet_NOVA_v3_12sept Plan projet!E7` |
| A-09 | Corriger le registre des risques : passer R-01 (connecteur) à « Fermé » en citant INT-101 du 17 sept., et ajouter les risques contrat et facturation | Nicolas Perron / Marc Gervais (propriétaire de R-01) (proposé) | à confirmer | recommandation équipe | à faire | `Registre_Risques_29sept Risques!F2`, `INT-101 L18` |
| A-10 | Bloquer et corriger le message « NOVA au vert, sécurité et accessibilité complétées » | Nicolas Perron avec Alex Deschamps (proposé) | immédiat (avant toute diffusion) | recommandation équipe | à faire | `E11 L5`, `E09 L7` |
| A-11 | Republier le rapport de statut : sécurité et accessibilité en JAUNE/ROUGE tant que GL-1 et GL-2 sont ouverts | Nicolas Perron (proposé) | à confirmer | recommandation équipe | à faire | `Rapport_Statut_21sept p.1` |
| A-12 | Rappeler à Boréal par écrit qu'aucun travail CR-04 ne doit être exécuté ni facturé en phase 1 | Nicolas Perron (proposé) | à confirmer | recommandation équipe | à faire | `M06 L22-L23`, `E10 L5` |
| A-13 | Planifier une réunion go/no-go formelle avant le 22 oct. et prévoir un plan si la date glisse (fin du contrat le 31 oct.) | Nicolas Perron (proposé) | à confirmer | recommandation équipe | à faire | `CONTRAT_Boreal_NOVA p.1`, `M04 L15` |

## Principaux risques

1. **Les trois conditions de go-live sont ouvertes à 22 jours du lancement, et aucune n'a de date d'échéance** (élevé) — SEC-210 n'est pas accepté, ACC-303 est ouvert et le runbook est incomplet. Aucune date ferme n'est documentée pour les fermer. *Mitigation : A-01 à A-05, A-13.* `M06 L11-L16`, `Registre_Risques_29sept Risques!ligne 3`, `Registre_Risques_29sept Risques!ligne 4`
2. **Exploitation : pas de procédure de retour arrière exécutable** (élevé) — Le runbook n'est toujours pas final au 29 sept. Sans lui, pas de go exploitation, et la mise en production n'aurait pas de filet. *Mitigation : A-04, A-05.* `OPS-601 L16`, `OPS-601_runbook capture`
3. **Information erronée et dépassement de portée : statut « vert » prématuré, CR-04 facturé sans approbation** (moyen-élevé) — Un rapport et une communication présentent la sécurité et l'accessibilité comme complétées. INV-003 facture 18 000 $ hors portée, et Boréal a commencé des ajustements mobiles. *Mitigation : A-06, A-07, A-10, A-11, A-12.* `Rapport_Statut_21sept p.1`, `E11 L5`, `INV-003 p.1`, `M06 L22`
4. **Marge contractuelle faible : le contrat se termine le 31 oct.** (moyen) — Si le 22 oct. glisse de plus de 9 jours, la mise en production sort de la période contractuelle. Aucune prolongation n'est documentée. *Mitigation : A-13.* `CONTRAT_Boreal_NOVA p.1`, `M04 L15`

## Budget et factures (CAD, hors taxes)

- **Autorisé :** Contrat — montant maximal initial 180 000 $ (`CONTRAT_Boreal_NOVA p.1`) + CR-01 Rapports avancés — APPROUVÉ le 14 août 24 000 $ (`CR-01_Rapports_avances_APPROUVE p.1`) = **204 000 $**
- **Non autorisé :** CR-04 Optimisation mobile — BROUILLON, reporté en phase 2 18 000 $ (`CR-04_Optimisation_mobile_BROUILLON p.1`, `Decision_Portee_Phase2 L4`)

| Facture | Date | Lignes | Total | Statut | Preuves |
|---|---|---|---|---|---|
| INV-001 | 2026-07-31 | Développement phase 1 — acompte 60 000 $ | 60 000 $ | Payée | `INV-001 p.1` |
| INV-002 | 2026-08-31 | Développement phase 1 — jalon 2 48 000 $<br>Rapports avancés — CR-01 24 000 $ | 72 000 $ | Payée | `INV-002 p.1` |
| INV-003 | 2026-09-22 | Développement phase 1 — jalon 3 36 000 $<br>Optimisation interface mobile — CR-04 18 000 $ **(non autorisé)** | 54 000 $ | En validation — 18 000 $ facturés pour CR-04, non approuvé | `INV-003 p.1`, `E07 L5` |

Exclues : INV-778 (41 000 $) — Projet ORION, pas NOVA (« Cette facture concerne un autre projet ») — à exclure des totaux

## Informations manquantes ou incertaines

- **Date du re-test sécurité de SEC-210** — Le ticket indique « Re-test planifié » le 26 sept., sans date. `SEC-210 L25`
- **Date de la « prochaine build » avec le correctif ACC-303** — Le correctif est annoncé, mais sans échéance. `ACC-303 L16`, `M06 L15`
- **Échéance de la version finale du runbook** — Seulement « quelques jours avant » (Olivier) ; le plan v3 fait finir P-05 le 10 oct., mais ce plan n'est pas à jour. `M04 L12`, `Plan_Projet_NOVA_v3_12sept Plan projet!F6`
- **Acceptation du livrable « jalon 3 » (36 000 $)** — Aucune preuve que le jalon 3 a été accepté avant le paiement de cette ligne. `INV-003 p.1`
- **Réponse de Nicolas aux Finances (E07) et statut final d'INV-003** — Aucune réponse documentée au 30 sept. `E07 L5`
- **Instance et date de la décision finale go/no-go** — Les conditions sont définies, mais aucune réunion go/no-go n'est planifiée dans le corpus. `M06 L16`
- **Plan si la date glisse au-delà du 31 oct. (fin du contrat)** — Aucune prolongation ni plan de contingence documenté. `CONTRAT_Boreal_NOVA p.1`
- **Vérification de la journalisation admin « en situation réelle »** — Demandée par Sophie le 27 août ; elle sera couverte par le re-test SEC-210, à confirmer. `M03 L11`

## Sources écartées ou non indépendantes

- `Courriel_archive_17sept` (08_Archives_et_documents_connexes/Courriel_archive_17sept.eml) — Copie exacte d'E12 : pas une confirmation indépendante.
- `INV-778_Projet_ORION` (08_Archives_et_documents_connexes/INV-778_Projet_ORION.pdf) — Facture d'un autre projet (ORION) : à exclure des totaux NOVA.
- `Newsletter_Boreal_Septembre` (08_Archives_et_documents_connexes/Newsletter_Boreal_Septembre.txt) — Infolettre marketing du fournisseur, sans fait NOVA.
- `Invitation_Formation_Excel` (08_Archives_et_documents_connexes/Invitation_Formation_Excel.txt) — Formation interne sans lien avec NOVA.
- `Notes_personnelles_quelquun` (08_Archives_et_documents_connexes/Notes_personnelles_quelquun.txt) — Notes non officielles, auteur inconnu (« 15 oct. probablement ») : aucune autorité.
- `Plan_NOVA_preliminaire_juin` (08_Archives_et_documents_connexes/Plan_NOVA_preliminaire_juin.xlsx) — Plan préliminaire antérieur au démarrage : historique.
- `Architecture_NOVA_v1` (06_Architecture_et_decisions/Architecture_NOVA_v1.pdf) — Remplacée par l'ADR-007 sur la localisation des données.
- `E02` (01_Courriels/E02_Question_hebergement.eml) — Pièce jointe Architecture_NOVA_v1.pdf, identique au fichier séparé.
- `E03` (01_Courriels/E03_Confirmation_Canada_Central.eml) — Pièce jointe Architecture_NOVA_v2.pdf, identique au fichier séparé (pas une 2e preuve).
- `E07` (01_Courriels/E07_Facture_003_question.eml) — Pièce jointe INV-003.pdf, identique au fichier séparé.
- `E10` (01_Courriels/E10_Fonction_mobile.eml) — Pièce jointe CR-04 brouillon, identique au fichier séparé.
- `E11` (01_Courriels/E11_Communication_statut.eml) — Pièce jointe Rapport_Statut_21sept.pdf, identique au fichier séparé.

## Index des sources (64)

- `E01` — 01_Courriels/E01_Lancement_NOVA.eml
- `E02` — 01_Courriels/E02_Question_hebergement.eml
- `E03` — 01_Courriels/E03_Confirmation_Canada_Central.eml
- `E04` — 01_Courriels/E04_Corrections_accessibilite.eml
- `E05` — 01_Courriels/E05_Retard_integration.eml
- `E06` — 01_Courriels/E06_Transition_charge_projet.eml
- `E07` — 01_Courriels/E07_Facture_003_question.eml
- `E08` — 01_Courriels/E08_Correctif_journalisation.eml
- `E09` — 01_Courriels/E09_Rappel_mise_en_production.eml
- `E10` — 01_Courriels/E10_Fonction_mobile.eml
- `E11` — 01_Courriels/E11_Communication_statut.eml
- `E12` — 01_Courriels/E12_Resolution_integration.eml
- `M01` — 02_Reunions/M01_CR_Demarrage_07juillet.txt
- `M02` — 02_Reunions/M02_Transcript_Architecture_23juillet.txt
- `M03` — 02_Reunions/M03_CR_Comite_27aout.txt
- `M04` — 02_Reunions/M04_Transcript_Comite_direction_10sept.txt
- `M05` — 02_Reunions/M05_CR_Suivi_18sept.txt
- `M06` — 02_Reunions/M06_Transcript_Comite_26sept.txt
- `ACC-301_labels` — 03_Tickets/ACC-301_labels.png (capture, transcription manuelle)
- `ACC-301` — 03_Tickets/ACC-301.txt
- `ACC-302_contraste` — 03_Tickets/ACC-302_contraste.png (capture, transcription manuelle)
- `ACC-302` — 03_Tickets/ACC-302.txt
- `ACC-303_focus` — 03_Tickets/ACC-303_focus.png (capture, transcription manuelle)
- `ACC-303` — 03_Tickets/ACC-303.txt
- `DATA-401_doublons` — 03_Tickets/DATA-401_doublons.png (capture, transcription manuelle)
- `DATA-401_echantillon` — 03_Tickets/DATA-401_echantillon.csv
- `DATA-401` — 03_Tickets/DATA-401.txt
- `INT-101_aucun_resultat` — 03_Tickets/INT-101_aucun_resultat.png (capture, transcription manuelle)
- `INT-101_extrait_logs` — 03_Tickets/INT-101_extrait_logs.txt
- `INT-101` — 03_Tickets/INT-101.txt
- `OPS-601_runbook` — 03_Tickets/OPS-601_runbook.png (capture, transcription manuelle)
- `OPS-601` — 03_Tickets/OPS-601.txt
- `PERF-501_lenteur` — 03_Tickets/PERF-501_lenteur.png (capture, transcription manuelle)
- `PERF-501` — 03_Tickets/PERF-501.txt
- `SEC-210_audit` — 03_Tickets/SEC-210_audit.png (capture, transcription manuelle)
- `SEC-210` — 03_Tickets/SEC-210.txt
- `Charte_Projet_NOVA_v1` — 04_Documents_projet/Charte_Projet_NOVA_v1.txt
- `Note_transition_Elodie_16sept` — 04_Documents_projet/Note_transition_Elodie_16sept.txt
- `Plan_Projet_NOVA_v2` — 04_Documents_projet/Plan_Projet_NOVA_v2.xlsx
- `Plan_Projet_NOVA_v3_12sept` — 04_Documents_projet/Plan_Projet_NOVA_v3_12sept.xlsx
- `Rapport_Statut_21sept` — 04_Documents_projet/Rapport_Statut_21sept.pdf
- `Registre_Risques_29sept` — 04_Documents_projet/Registre_Risques_29sept.xlsx
- `CONTRAT_Boreal_NOVA` — 05_Contrats_et_finances/CONTRAT_Boreal_NOVA.pdf
- `CR-01_Rapports_avances_APPROUVE` — 05_Contrats_et_finances/CR-01_Rapports_avances_APPROUVE.pdf
- `CR-04_Optimisation_mobile_BROUILLON` — 05_Contrats_et_finances/CR-04_Optimisation_mobile_BROUILLON.pdf
- `INV-001` — 05_Contrats_et_finances/INV-001.pdf
- `INV-002` — 05_Contrats_et_finances/INV-002.pdf
- `INV-003` — 05_Contrats_et_finances/INV-003.pdf
- `ADR-007_Localisation_donnees` — 06_Architecture_et_decisions/ADR-007_Localisation_donnees.md
- `Architecture_NOVA_v1` — 06_Architecture_et_decisions/Architecture_NOVA_v1.pdf
- `Architecture_NOVA_v2` — 06_Architecture_et_decisions/Architecture_NOVA_v2.pdf
- `Decision_Portee_Phase2` — 06_Architecture_et_decisions/Decision_Portee_Phase2.md
- `Teams_15sept_ProjetNOVA` — 07_Conversations_Teams/Teams_15sept_ProjetNOVA.txt
- `Teams_16sept_Transition` — 07_Conversations_Teams/Teams_16sept_Transition.txt
- `Teams_19sept_Securite` — 07_Conversations_Teams/Teams_19sept_Securite.txt
- `Teams_22sept_Mobile` — 07_Conversations_Teams/Teams_22sept_Mobile.txt
- `Courriel_archive_17sept` — 08_Archives_et_documents_connexes/Courriel_archive_17sept.eml
- `INV-778_Projet_ORION` — 08_Archives_et_documents_connexes/INV-778_Projet_ORION.pdf
- `Invitation_Formation_Excel` — 08_Archives_et_documents_connexes/Invitation_Formation_Excel.txt
- `Newsletter_Boreal_Septembre` — 08_Archives_et_documents_connexes/Newsletter_Boreal_Septembre.txt
- `Notes_personnelles_quelquun` — 08_Archives_et_documents_connexes/Notes_personnelles_quelquun.txt
- `Plan_NOVA_preliminaire_juin` — 08_Archives_et_documents_connexes/Plan_NOVA_preliminaire_juin.xlsx
- `MANIFEST` — MANIFEST.csv
- `README` — README.txt
