# Dossier de décisions et preuves — Baseline — état au 30 septembre 2026, 09:00 (Montréal)

## D-01 — Lancement : budget maximal 180 000 $, cible 15 oct., portée phase 1

**2026-07-07** · Décidé par : Rencontre de démarrage · Statut : partiellement remplacée

**Pourquoi :** Point de départ du projet.

### Preuves de la décision

> `M01` · L8-L12 (02_Reunions/M01_CR_Demarrage_07juillet.txt) — « Décisions - Élodie Caron agit comme chargée de projet. - Budget initial maximal : 180 000 $ CAD. - Cible de mise en production : 15 octobre 2026. - La phase 1 comprend SSO, création/suivi de demandes, pièces jointes, workflow, tableau de suivi et rapports standards. »
>
> `Charte_Projet_NOVA_v1` · L20 (04_Documents_projet/Charte_Projet_NOVA_v1.txt) — « Cette charte constitue le point de départ du projet et n'est pas mise à jour automatiquement après chaque décision de comité. »

### Chaîne des faits du sujet

- **2026-07-07 · décision** — Démarrage : budget 180 000 $, cible 15 oct., Élodie chargée de projet
  > `M01` · L8-L12 (02_Reunions/M01_CR_Demarrage_07juillet.txt) — « Décisions - Élodie Caron agit comme chargée de projet. - Budget initial maximal : 180 000 $ CAD. - Cible de mise en production : 15 octobre 2026. - La phase 1 comprend SSO, création/suivi de demandes, pièces jointes, workflow, tableau de suivi et rapports standards. »
  > `Charte_Projet_NOVA_v1` · L4-L7 (04_Documents_projet/Charte_Projet_NOVA_v1.txt) — « Chargée de projet : Élodie Caron Fournisseur : Boréal Numérique Budget initial : 180 000 $ CAD Date cible de mise en production : 15 octobre 2026 »
  > `E01` · L5 (01_Courriels/E01_Lancement_NOVA.eml) — « Les éléments de référence sont ceux de la charte : budget initial de 180 000 $, mise en production ciblée au 15 octobre et je prends le rôle de chargée de projet. »
- **2026-09-16 · décision** — Nicolas Perron devient officiellement chargé de projet
  > `E06` · L3 (01_Courriels/E06_Transition_charge_projet.eml) — « Comme convenu, Nicolas Perron prend officiellement la charge du projet NOVA à compter d'aujourd'hui, 16 septembre. »
  > `Note_transition_Elodie_16sept` · L4 (04_Documents_projet/Note_transition_Elodie_16sept.txt) — « À compter d'aujourd'hui, Nicolas Perron reprend le rôle de chargé de projet NOVA. »

## D-02 — Données de production au Canada — Canada Central (ADR-007)

**2026-07-23** · Décidé par : Atelier architecture : Élodie, Marc, Sophie, Julien · Statut : en vigueur

**Pourquoi :** Exigence de la sécurité : les données de production NOVA doivent demeurer au Canada. L'architecture v1 (East US) est remplacée.

### Preuves de la décision

> `M02` · L11-L17 (02_Reunions/M02_Transcript_Architecture_23juillet.txt) — « 09:06 Sophie : Pour moi, ce n'est pas juste une préférence. Les données de production NOVA doivent demeurer au Canada. Je veux qu'on le mette comme décision, pas comme note à revoir. 09:08 Julien : Aucun problème. On peut basculer le design. Il faudra quelques jours pour recréer les ressources et v… »
>
> `ADR-007_Localisation_donnees` · L7-L10 (06_Architecture_et_decisions/ADR-007_Localisation_donnees.md) — « L'architecture initiale de NOVA utilisait une région américaine. L'équipe sécurité demande que les données de production du projet demeurent au Canada. ## Décision L'environnement de production de NOVA sera déployé dans **Canada Central**. L'architecture v1 doit être considérée comme remplacée sur … »

### Chaîne des faits du sujet

- **2026-07-18 · fait** — Architecture v1 : données en East US
  > `Architecture_NOVA_v1` · p.1 (06_Architecture_et_decisions/Architecture_NOVA_v1.pdf) — « Architecture NOVA - v1 - 18 juillet 2026 Version initiale préparée avant la décision de localisation des données. Utilisateur Portail NOVA API Données East US Schéma fictif - Projet 360 »
- **2026-07-22 · risque** — Sophie Lambert exige que les données de production restent au Canada
  > `E02` · L3-L5 (01_Courriels/E02_Question_hebergement.eml) — « Je vois East US sur le diagramme joint. Avant qu'on aille plus loin, est-ce que quelqu'un peut confirmer si cette localisation est compatible avec nos exigences pour NOVA? Pour ma part, je veux que les données de production demeurent au Canada. À trancher demain en atelier. »
- **2026-07-23 · décision** — Atelier architecture : Canada Central, SSO seulement, audit admin à valider
  > `M02` · L13-L17 (02_Reunions/M02_Transcript_Architecture_23juillet.txt) — « 09:10 Élodie : Donc on tranche Canada Central? 09:10 Marc : Oui. 09:10 Sophie : Oui. 09:11 Julien : Oui de notre côté. 09:12 Élodie : Parfait. Je vais noter la décision et on fera un ADR. La v1 devient donc obsolète pour la localisation des données. »
  > `M02` · L30 (02_Reunions/M02_Transcript_Architecture_23juillet.txt) — « 09:43 Élodie : Donc résumé : Canada Central, SSO uniquement, audit admin à valider. Le reste continue. »
  > `ADR-007_Localisation_donnees` · L3-L4 (06_Architecture_et_decisions/ADR-007_Localisation_donnees.md) — « **Date de décision :** 23 juillet 2026 **Statut :** Acceptée »
- **2026-08-26 · livraison** — Boréal déclare la migration vers Canada Central complétée (schéma v2)
  > `E03` · L3-L5 (01_Courriels/E03_Confirmation_Canada_Central.eml) — « La migration des ressources prévues pour NOVA vers Canada Central est complétée. Vous trouverez le schéma v2 en pièce jointe. Nous avons fait un test de déploiement et de connectivité hier soir. Aucun blocage identifié. »
  > `Architecture_NOVA_v2` · p.1 (06_Architecture_et_decisions/Architecture_NOVA_v2.pdf) — « Architecture NOVA - v2 - 25 août 2026 Version révisée après ADR-007. Utilisateur Portail NOVA API Données Canada Central Schéma fictif - Projet 360 »
- **2026-08-27 · validation** — Comité : migration Canada Central vérifiée par l'équipe architecture
  > `M03` · L5 (02_Reunions/M03_CR_Comite_27aout.txt) — « - La migration de l'architecture vers Canada Central est déclarée terminée par Boréal et vérifiée par l'équipe architecture. »

## D-03 — CR-01 approuvé : rapports avancés et export de synthèse (+24 000 $)

**2026-08-14** · Décidé par : Comité de projet · Statut : en vigueur

**Pourquoi :** Ajout de portée approuvé par écrit, comme l'exige le contrat.

### Preuves de la décision

> `CR-01_Rapports_avances_APPROUVE` · p.1 (05_Contrats_et_finances/CR-01_Rapports_avances_APPROUVE.pdf) — « Document fictif - Changement approuvé Page 1 DEMANDE DE CHANGEMENT CR-01 Objet Ajout de rapports avancés et export de synthèse. Impact financier Montant 24 000 $ Décision APPROUVÉE Date de décision 14 août 2026 Autorité Comité de projet Impact calendrier Aucun changement de la date cible annoncé au… »
>
> `CONTRAT_Boreal_NOVA` · p.1 (05_Contrats_et_finances/CONTRAT_Boreal_NOVA.pdf) — « Contrat fictif - Défi Projet 360 Page 1 CONTRAT DE SERVICES - PROJET NOVA Parties Client fictif : Organisation Démo Fournisseur fictif : Boréal Numérique Inc. Objet Conception et réalisation de la phase 1 du portail NOVA. Valeur contractuelle Élément Valeur Montant maximal initial 180 000 $ Devise … »

### Chaîne des faits du sujet

- **2026-08-14 · décision** — CR-01 (rapports avancés, 24 000 $) APPROUVÉ par le comité de projet
  > `CR-01_Rapports_avances_APPROUVE` · p.1 (05_Contrats_et_finances/CR-01_Rapports_avances_APPROUVE.pdf) — « Document fictif - Changement approuvé Page 1 DEMANDE DE CHANGEMENT CR-01 Objet Ajout de rapports avancés et export de synthèse. Impact financier Montant 24 000 $ Décision APPROUVÉE Date de décision 14 août 2026 Autorité Comité de projet Impact calendrier Aucun changement de la date cible annoncé au… »

## D-04 — Mise en production reportée du 15 au 22 oct. 2026

**2026-09-10** · Décidé par : Comité de direction — décision formulée par Élodie Caron, sans objection de Sophie, Marc, Olivier et Nicolas · Proposé par : Boréal (Julien Moreau), le 8 sept. · Statut : en vigueur, conditionnelle

**Pourquoi :** Le connecteur interne (INT-101) était sur le chemin critique. La semaine de plus sert à stabiliser, à reprendre les tests intégrés et à éviter de compresser les tests de sécurité et d'accessibilité. Pas de pénalité contractuelle (contrat jusqu'à fin octobre).

### Preuves de la décision

> `E05` · L5-L7 (01_Courriels/E05_Retard_integration.eml) — « Notre recommandation est de déplacer la mise en production au **22 octobre**. À ce stade, il s'agit d'une proposition de notre part. À vous de confirmer la décision de gouvernance. »
>
> `M04` · L6-L23 (02_Reunions/M04_Transcript_Comite_direction_10sept.txt) — « 15:02 Julien : Comme écrit mardi, le connecteur nous a coûté plus de temps que prévu. Notre recommandation est de déplacer le lancement du 15 au 22 octobre. 15:03 Nicolas : On parle d'une semaine complète. Qu'est-ce que ça nous achète exactement? 15:04 Julien : Stabilisation du connecteur, reprise … »

### Chaîne des faits du sujet

- **2026-09-08 · proposition** — Boréal PROPOSE de reporter la mise en production au 22 oct.
  > `E05` · L3-L7 (01_Courriels/E05_Retard_integration.eml) — « Le problème du connecteur interne nous a fait perdre davantage de temps que prévu. Nous pouvons continuer à viser le 15 octobre, mais ce serait avec très peu de marge pour la stabilisation. Notre recommandation est de déplacer la mise en production au **22 octobre**. À ce stade, il s'agit d'une pro… »
- **2026-09-10 · décision** — Comité de direction : 22 oct. APPROUVÉ (formulé par Élodie, aucune objection)
  > `M04` · L17-L23 (02_Reunions/M04_Transcript_Comite_direction_10sept.txt) — « 15:22 Élodie : Je vais formuler la décision. La date cible de mise en production NOVA est déplacée du 15 octobre au **22 octobre 2026**. Est-ce que quelqu'un s'oppose? 15:23 [silence] 15:23 Sophie : Non. 15:23 Marc : Non. 15:24 Olivier : Non. 15:24 Nicolas : D'accord. 15:25 Élodie : Donc **approuvé… »
- **2026-09-12 · fait** — Plan projet v3 publié, mais il affiche toujours le 15 oct. pour P-06
  > `Plan_Projet_NOVA_v3_12sept` · Plan projet!E7 (04_Documents_projet/Plan_Projet_NOVA_v3_12sept.xlsx) — « E7=2026-10-15 »
- **2026-09-26 · décision** — Comité : le 22 oct. reste la cible, CONDITIONNELLE à trois éléments
  > `M06` · L11-L16 (02_Reunions/M06_Transcript_Comite_26sept.txt) — « 10:09 Nicolas : Donc trois conditions concrètes : validation sécurité de SEC-210, fermeture de ACC-303 et approbation du runbook incluant rollback. Exact? 10:10 Sophie : Oui. 10:10 Mélissa : Oui. 10:10 Olivier : Oui. 10:12 Julien : On vise le correctif ACC-303 dans la prochaine build. Pour le runbo… »
- **2026-09-27 · fait** — Rappel de Nicolas : ne pas communiquer le 22 comme un go garanti
  > `E09` · L3-L7 (01_Courriels/E09_Rappel_mise_en_production.eml) — « Petit rappel pour éviter les versions différentes : la cible approuvée demeure le 22 octobre. Cette date est toutefois conditionnelle aux validations restantes : sécurité, accessibilité et préparation exploitation. Le comité du 26 septembre a précisé les éléments à fermer. Merci de ne pas communiqu… »

## D-05 — Nicolas Perron reprend la charge du projet

**2026-09-16** · Décidé par : Élodie Caron (« comme convenu ») · Statut : en vigueur

**Pourquoi :** Transition de la charge de projet.

### Preuves de la décision

> `E06` · L3-L5 (01_Courriels/E06_Transition_charge_projet.eml) — « Comme convenu, Nicolas Perron prend officiellement la charge du projet NOVA à compter d'aujourd'hui, 16 septembre. Je demeure disponible quelques jours pour assurer le transfert, mais merci de diriger les décisions et suivis futurs vers Nicolas. »
>
> `Teams_16sept_Transition` · L4-L5 (07_Conversations_Teams/Teams_16sept_Transition.txt) — « 08:45 - Élodie : Petit rappel : à partir d'aujourd'hui, Nicolas reprend officiellement NOVA. Merci de l'inclure dans les suivis et décisions. Je reste joignable quelques jours pour la transition. 08:47 - Nicolas : Merci Élodie. Je reprends aussi le comité du vendredi. »

### Chaîne des faits du sujet

- **2026-07-07 · décision** — Démarrage : budget 180 000 $, cible 15 oct., Élodie chargée de projet
  > `M01` · L8-L12 (02_Reunions/M01_CR_Demarrage_07juillet.txt) — « Décisions - Élodie Caron agit comme chargée de projet. - Budget initial maximal : 180 000 $ CAD. - Cible de mise en production : 15 octobre 2026. - La phase 1 comprend SSO, création/suivi de demandes, pièces jointes, workflow, tableau de suivi et rapports standards. »
  > `Charte_Projet_NOVA_v1` · L4-L7 (04_Documents_projet/Charte_Projet_NOVA_v1.txt) — « Chargée de projet : Élodie Caron Fournisseur : Boréal Numérique Budget initial : 180 000 $ CAD Date cible de mise en production : 15 octobre 2026 »
  > `E01` · L5 (01_Courriels/E01_Lancement_NOVA.eml) — « Les éléments de référence sont ceux de la charte : budget initial de 180 000 $, mise en production ciblée au 15 octobre et je prends le rôle de chargée de projet. »
- **2026-09-16 · décision** — Nicolas Perron devient officiellement chargé de projet
  > `E06` · L3 (01_Courriels/E06_Transition_charge_projet.eml) — « Comme convenu, Nicolas Perron prend officiellement la charge du projet NOVA à compter d'aujourd'hui, 16 septembre. »
  > `Note_transition_Elodie_16sept` · L4 (04_Documents_projet/Note_transition_Elodie_16sept.txt) — « À compter d'aujourd'hui, Nicolas Perron reprend le rôle de chargé de projet NOVA. »

## D-06 — Optimisations mobiles avancées (CR-04) reportées en phase 2

**2026-09-24** · Décidé par : Nicolas Perron (chargé de projet) · Statut : en vigueur

**Pourquoi :** Hors de la portée approuvée de la phase 1 (charte, contrat). Le comité du 10 sept. n'avait pris aucune décision de dépense. La phase 1 doit rester utilisable sur mobile.

### Preuves de la décision

> `Decision_Portee_Phase2` · L3-L6 (06_Architecture_et_decisions/Decision_Portee_Phase2.md) — « **Date :** 24 septembre 2026 **Décision :** Les optimisations mobiles avancées associées à la demande CR-04 sont reportées à la phase 2. La phase 1 doit demeurer utilisable sur mobile, mais les travaux d'optimisation avancée proposés par Boréal ne font pas partie de la portée approuvée de la phase … »
>
> `E10` · L3-L5 (01_Courriels/E10_Fonction_mobile.eml) — « Pour clarifier la portée : les optimisations mobiles avancées proposées dans CR-04 ne font pas partie de la phase 1 approuvée. Nous les reportons à la phase 2. Aucune dépense liée à CR-04 ne doit être engagée ou facturée sans nouvelle approbation. »
>
> `M04` · L33-L35 (02_Reunions/M04_Transcript_Comite_direction_10sept.txt) — « 15:37 Élodie : Pas selon la portée actuelle. On va traiter ça séparément, aucune approbation aujourd'hui. 15:38 Sophie : Merci de ne pas mélanger ça avec les corrections d'accessibilité obligatoires. 15:40 Élodie : Très bon point. On ferme. Nouvelle date officielle : 22 octobre. Mobile : aucune déc… »

### Chaîne des faits du sujet

- **2026-09-04 · proposition** — Boréal soumet CR-04 (mobile avancé, 18 000 $) — brouillon
  > `CR-04_Optimisation_mobile_BROUILLON` · p.1 (05_Contrats_et_finances/CR-04_Optimisation_mobile_BROUILLON.pdf) — « BROUILLON - Document fictif Page 1 DEMANDE DE CHANGEMENT CR-04 - BROUILLON Objet Optimisation avancée de l’expérience mobile pour écrans de moins de 768 px. Estimation Montant estimé 18 000 $ Statut BROUILLON - APPROBATION REQUISE Demande initiale 4 septembre 2026 Demandeur Boréal Numérique Note Au… »
- **2026-09-10 · décision** — Mobile (≈ 18 000 $) : aucune décision de dépense
  > `M04` · L33-L35 (02_Reunions/M04_Transcript_Comite_direction_10sept.txt) — « 15:37 Élodie : Pas selon la portée actuelle. On va traiter ça séparément, aucune approbation aujourd'hui. 15:38 Sophie : Merci de ne pas mélanger ça avec les corrections d'accessibilité obligatoires. 15:40 Élodie : Très bon point. On ferme. Nouvelle date officielle : 22 octobre. Mobile : aucune déc… »
- **2026-09-24 · décision** — Décision de portée : CR-04 reporté en phase 2, aucune dépense sans approbation
  > `Decision_Portee_Phase2` · L3-L6 (06_Architecture_et_decisions/Decision_Portee_Phase2.md) — « **Date :** 24 septembre 2026 **Décision :** Les optimisations mobiles avancées associées à la demande CR-04 sont reportées à la phase 2. La phase 1 doit demeurer utilisable sur mobile, mais les travaux d'optimisation avancée proposés par Boréal ne font pas partie de la portée approuvée de la phase … »
  > `E10` · L3-L5 (01_Courriels/E10_Fonction_mobile.eml) — « Pour clarifier la portée : les optimisations mobiles avancées proposées dans CR-04 ne font pas partie de la phase 1 approuvée. Nous les reportons à la phase 2. Aucune dépense liée à CR-04 ne doit être engagée ou facturée sans nouvelle approbation. »

## D-07 — Le 22 oct. est conditionné à trois éléments de go-live

**2026-09-26** · Décidé par : Comité de direction — Nicolas Perron, confirmé par Sophie, Mélissa et Olivier · Statut : en vigueur

**Pourquoi :** Validation sécurité de SEC-210, fermeture d'ACC-303 et approbation du runbook (incluant le retour arrière).

### Preuves de la décision

> `M06` · L11-L16 (02_Reunions/M06_Transcript_Comite_26sept.txt) — « 10:09 Nicolas : Donc trois conditions concrètes : validation sécurité de SEC-210, fermeture de ACC-303 et approbation du runbook incluant rollback. Exact? 10:10 Sophie : Oui. 10:10 Mélissa : Oui. 10:10 Olivier : Oui. 10:12 Julien : On vise le correctif ACC-303 dans la prochaine build. Pour le runbo… »

### Chaîne des faits du sujet

- **2026-09-08 · proposition** — Boréal PROPOSE de reporter la mise en production au 22 oct.
  > `E05` · L3-L7 (01_Courriels/E05_Retard_integration.eml) — « Le problème du connecteur interne nous a fait perdre davantage de temps que prévu. Nous pouvons continuer à viser le 15 octobre, mais ce serait avec très peu de marge pour la stabilisation. Notre recommandation est de déplacer la mise en production au **22 octobre**. À ce stade, il s'agit d'une pro… »
- **2026-09-10 · décision** — Comité de direction : 22 oct. APPROUVÉ (formulé par Élodie, aucune objection)
  > `M04` · L17-L23 (02_Reunions/M04_Transcript_Comite_direction_10sept.txt) — « 15:22 Élodie : Je vais formuler la décision. La date cible de mise en production NOVA est déplacée du 15 octobre au **22 octobre 2026**. Est-ce que quelqu'un s'oppose? 15:23 [silence] 15:23 Sophie : Non. 15:23 Marc : Non. 15:24 Olivier : Non. 15:24 Nicolas : D'accord. 15:25 Élodie : Donc **approuvé… »
- **2026-09-12 · fait** — Plan projet v3 publié, mais il affiche toujours le 15 oct. pour P-06
  > `Plan_Projet_NOVA_v3_12sept` · Plan projet!E7 (04_Documents_projet/Plan_Projet_NOVA_v3_12sept.xlsx) — « E7=2026-10-15 »
- **2026-09-26 · décision** — Comité : le 22 oct. reste la cible, CONDITIONNELLE à trois éléments
  > `M06` · L11-L16 (02_Reunions/M06_Transcript_Comite_26sept.txt) — « 10:09 Nicolas : Donc trois conditions concrètes : validation sécurité de SEC-210, fermeture de ACC-303 et approbation du runbook incluant rollback. Exact? 10:10 Sophie : Oui. 10:10 Mélissa : Oui. 10:10 Olivier : Oui. 10:12 Julien : On vise le correctif ACC-303 dans la prochaine build. Pour le runbo… »
- **2026-09-27 · fait** — Rappel de Nicolas : ne pas communiquer le 22 comme un go garanti
  > `E09` · L3-L7 (01_Courriels/E09_Rappel_mise_en_production.eml) — « Petit rappel pour éviter les versions différentes : la cible approuvée demeure le 22 octobre. Cette date est toutefois conditionnelle aux validations restantes : sécurité, accessibilité et préparation exploitation. Le comité du 26 septembre a précisé les éléments à fermer. Merci de ne pas communiqu… »
