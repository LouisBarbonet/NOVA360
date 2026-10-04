# Réponses aux dix questions — Baseline — état au 30 septembre 2026, 09:00 (Montréal)

Chaque réponse cite un fichier du corpus et un repère précis (L = ligne, p. = page, Feuille!cellule, capture), avec l'extrait exact.

## Q01. Quelle est la date de mise en production actuellement approuvée, et avec quelle réserve?

**Réponse :** Le 22 octobre 2026. Ce n'est pas un go garanti : la date est conditionnelle à trois éléments (validation sécurité de SEC-210, fermeture d'ACC-303, approbation du runbook avec retour arrière).

Le comité de direction a approuvé le 22 octobre le 10 septembre (M04 L17-L23). Le comité du 26 septembre a précisé que la date reste conditionnelle à trois éléments : la validation sécurité de SEC-210, la fermeture d'ACC-303 et l'approbation du runbook incluant le retour arrière (M06 L11-L16). Nicolas a fait un rappel le 27 sept. : « ne pas communiquer le 22 comme un go garanti » (E09 L7). Au 30 sept., les trois conditions sont ouvertes. Le plan v3, qui indique encore le 15 oct., est périmé (voir C-01).

**Preuves :**

> `M04` · L17-L23 (02_Reunions/M04_Transcript_Comite_direction_10sept.txt) — « 15:22 Élodie : Je vais formuler la décision. La date cible de mise en production NOVA est déplacée du 15 octobre au **22 octobre 2026**. Est-ce que quelqu'un s'oppose? 15:23 [silence] 15:23 Sophie : Non. 15:23 Marc : Non. 15:24 Olivier : Non. 15:24 Nicolas : D'accord. 15:25 Élodie : Donc **approuvé… »
>
> `M06` · L11-L16 (02_Reunions/M06_Transcript_Comite_26sept.txt) — « 10:09 Nicolas : Donc trois conditions concrètes : validation sécurité de SEC-210, fermeture de ACC-303 et approbation du runbook incluant rollback. Exact? 10:10 Sophie : Oui. 10:10 Mélissa : Oui. 10:10 Olivier : Oui. 10:12 Julien : On vise le correctif ACC-303 dans la prochaine build. Pour le runbo… »
>
> `E09` · L3-L7 (01_Courriels/E09_Rappel_mise_en_production.eml) — « Petit rappel pour éviter les versions différentes : la cible approuvée demeure le 22 octobre. Cette date est toutefois conditionnelle aux validations restantes : sécurité, accessibilité et préparation exploitation. Le comité du 26 septembre a précisé les éléments à fermer. Merci de ne pas communiqu… »

## Q02. Pourquoi la date a-t-elle changé, et quel est l'état actuel de la cause initiale?

**Réponse :** À cause du connecteur interne (INT-101), qui était sur le chemin critique. Cette cause est résolue : INT-101 est fermé depuis le 17 sept.

Cause : le problème du connecteur interne a fait perdre du temps à Boréal (E05 L3). Les recherches retournaient vide à cause d'erreurs 401 : le jeton de service avait expiré après un changement de secret, et des erreurs intermittentes persistaient (INT-101 L14-L16 ; extrait de logs L1-L2). Marc a confirmé en comité que le connecteur était le chemin critique (M04 L9). La semaine de plus servait aussi à ne pas compresser les tests de sécurité et d'accessibilité (M04 L10-L11). État actuel : la correction (rotation du secret + renouvellement du jeton) a été déployée, puis 120/120 recherches ont été validées. Marc a fermé INT-101 le 17 sept. (INT-101 L17-L20 ; E12 L3-L5 ; M05 L6 ; journal 200 OK L3). Attention : le registre du 29 sept. indique encore R-01 « Ouvert » avec un suivi au 9 sept. C'est une donnée périmée (C-02). La date n'a pas été ramenée au 15 : les autres conditions de go-live dominent maintenant.

**Preuves :**

> `E05` · L3-L5 (01_Courriels/E05_Retard_integration.eml) — « Le problème du connecteur interne nous a fait perdre davantage de temps que prévu. Nous pouvons continuer à viser le 15 octobre, mais ce serait avec très peu de marge pour la stabilisation. Notre recommandation est de déplacer la mise en production au **22 octobre**. »
>
> `M04` · L9 (02_Reunions/M04_Transcript_Comite_direction_10sept.txt) — « 15:06 Marc : Je confirme que le connecteur est le chemin critique en ce moment. Le problème n'est pas juste un écran. Il touche les recherches et la synchronisation. »
>
> `INT-101` · L17-L20 (03_Tickets/INT-101.txt) — « 17 sept 14:23 - Boréal : Correctif déployé. 120 recherches rejouées, 120 réponses valides. 17 sept 16:10 - Marc : Validé côté intégration. Je ferme. Résolution : rotation du secret + correction de la logique de renouvellement du jeton. »
>
> `E12` · L5 (01_Courriels/E12_Resolution_integration.eml) — « INT-101 est fermé. Le problème d'intégration qui avait déclenché le risque d'échéancier est considéré résolu. »
>
> `Registre_Risques_29sept` · Risques!F2 (04_Documents_projet/Registre_Risques_29sept.xlsx) — « F2=Ouvert »

## Q03. Qui a approuvé le changement et quand? Distinguez proposition et approbation.

**Réponse :** Proposition : Boréal (Julien Moreau), le 8 sept. Approbation : le comité de direction, le 10 sept. 2026 vers 15:25.

Proposition : Julien Moreau (Boréal) écrit le 8 sept. « Notre recommandation est de déplacer la mise en production au 22 octobre […] il s'agit d'une proposition de notre part. À vous de confirmer la décision de gouvernance » (E05 L5-L7). Il la répète en comité (M04 L6). Approbation : comité de direction du 10 sept. Élodie Caron, alors chargée de projet, formule la décision (15:22) ; Sophie, Marc, Olivier et Nicolas ne s'y opposent pas ; elle déclare « Donc approuvé » à 15:25 (M04 L17-L23). Confirmations ultérieures : Teams du 15 sept. L5, note de transition L7, M05 L13. Ce ne sont pas de nouvelles approbations.

**Preuves :**

> `E05` · L5-L7 (01_Courriels/E05_Retard_integration.eml) — « Notre recommandation est de déplacer la mise en production au **22 octobre**. À ce stade, il s'agit d'une proposition de notre part. À vous de confirmer la décision de gouvernance. »
>
> `M04` · L17-L23 (02_Reunions/M04_Transcript_Comite_direction_10sept.txt) — « 15:22 Élodie : Je vais formuler la décision. La date cible de mise en production NOVA est déplacée du 15 octobre au **22 octobre 2026**. Est-ce que quelqu'un s'oppose? 15:23 [silence] 15:23 Sophie : Non. 15:23 Marc : Non. 15:24 Olivier : Non. 15:24 Nicolas : D'accord. 15:25 Élodie : Donc **approuvé… »
>
> `Teams_15sept_ProjetNOVA` · L5 (07_Conversations_Teams/Teams_15sept_ProjetNOVA.txt) — « 09:18 - Nicolas : Non, attention : le comité a approuvé le 22 octobre le 10 septembre. Le plan projet n'a visiblement pas encore été corrigé. »

## Q04. Qui est responsable du projet et depuis quand?

**Réponse :** Nicolas Perron, depuis le 16 septembre 2026. Avant lui : Élodie Caron, depuis le 7 juillet.

Élodie Caron annonce que « Nicolas Perron prend officiellement la charge du projet NOVA à compter d'aujourd'hui, 16 septembre » et demande d'adresser les décisions à Nicolas (E06 L3-L5). La note de transition (L4) et Teams (16 sept. L4-L5) le confirment ; Nicolas reprend aussi le comité du vendredi. Élodie était chargée de projet depuis le démarrage du 7 juillet (M01 L9 ; charte L4, non mise à jour).

**Preuves :**

> `E06` · L3-L5 (01_Courriels/E06_Transition_charge_projet.eml) — « Comme convenu, Nicolas Perron prend officiellement la charge du projet NOVA à compter d'aujourd'hui, 16 septembre. Je demeure disponible quelques jours pour assurer le transfert, mais merci de diriger les décisions et suivis futurs vers Nicolas. »
>
> `Note_transition_Elodie_16sept` · L4 (04_Documents_projet/Note_transition_Elodie_16sept.txt) — « À compter d'aujourd'hui, Nicolas Perron reprend le rôle de chargé de projet NOVA. »
>
> `Teams_16sept_Transition` · L4-L5 (07_Conversations_Teams/Teams_16sept_Transition.txt) — « 08:45 - Élodie : Petit rappel : à partir d'aujourd'hui, Nicolas reprend officiellement NOVA. Merci de l'inclure dans les suivis et décisions. Je reste joignable quelques jours pour la transition. 08:47 - Nicolas : Merci Élodie. Je reprends aussi le comité du vendredi. »

## Q05. Quel est le montant contractuel autorisé et comment se calcule-t-il?

**Réponse :** 204 000 $ CAD (hors taxes) = 180 000 $ (contrat initial) + 24 000 $ (CR-01 approuvé). CR-04 (18 000 $) n'est pas inclus.

Le contrat fixe un montant maximal initial de 180 000 $ CAD pour la période du 7 juillet au 31 oct. 2026 (contrat p.1). Le comité de projet a APPROUVÉ CR-01 (rapports avancés, 24 000 $) le 14 août (CR-01 p.1). Total autorisé : 180 000 + 24 000 = 204 000 $. CR-04 (18 000 $) est un BROUILLON sans approbation (CR-04 p.1), reporté en phase 2 (Decision_Portee_Phase2) : il ne s'ajoute pas. Situation actuelle : 132 000 $ facturés et payés (INV-001 60 000 $ + INV-002 72 000 $) ; 54 000 $ en validation (INV-003), dont seulement 36 000 $ sont admissibles. Si on retient 36 000 $, le total facturé admissible atteint 168 000 $ et il reste 36 000 $ sur l'autorisé. INV-778 (ORION, 41 000 $) est exclue.

**Preuves :**

> `CONTRAT_Boreal_NOVA` · p.1 (05_Contrats_et_finances/CONTRAT_Boreal_NOVA.pdf) — « Contrat fictif - Défi Projet 360 Page 1 CONTRAT DE SERVICES - PROJET NOVA Parties Client fictif : Organisation Démo Fournisseur fictif : Boréal Numérique Inc. Objet Conception et réalisation de la phase 1 du portail NOVA. Valeur contractuelle Élément Valeur Montant maximal initial 180 000 $ Devise … »
>
> `CR-01_Rapports_avances_APPROUVE` · p.1 (05_Contrats_et_finances/CR-01_Rapports_avances_APPROUVE.pdf) — « Document fictif - Changement approuvé Page 1 DEMANDE DE CHANGEMENT CR-01 Objet Ajout de rapports avancés et export de synthèse. Impact financier Montant 24 000 $ Décision APPROUVÉE Date de décision 14 août 2026 Autorité Comité de projet Impact calendrier Aucun changement de la date cible annoncé au… »
>
> `CR-04_Optimisation_mobile_BROUILLON` · p.1 (05_Contrats_et_finances/CR-04_Optimisation_mobile_BROUILLON.pdf) — « BROUILLON - Document fictif Page 1 DEMANDE DE CHANGEMENT CR-04 - BROUILLON Objet Optimisation avancée de l’expérience mobile pour écrans de moins de 768 px. Estimation Montant estimé 18 000 $ Statut BROUILLON - APPROBATION REQUISE Demande initiale 4 septembre 2026 Demandeur Boréal Numérique Note Au… »
>
> `INV-001` · p.1 (05_Contrats_et_finances/INV-001.pdf) — « Document synthétique - Aucun fournisseur réel Page 1 FACTURE INV-001 Fournisseur Boréal Numérique Inc. 1450, rue des Ateliers, Montréal (QC) H3X 0A1 Numéro fournisseur fictif : BN-4481 Détails Facture INV-001 Projet NOVA Date 2026-07-31 Statut Payée Facturation Description Montant Développement pha… »
>
> `INV-002` · p.1 (05_Contrats_et_finances/INV-002.pdf) — « Document synthétique - Aucun fournisseur réel Page 1 FACTURE INV-002 Fournisseur Boréal Numérique Inc. 1450, rue des Ateliers, Montréal (QC) H3X 0A1 Numéro fournisseur fictif : BN-4481 Détails Facture INV-002 Projet NOVA Date 2026-08-31 Statut Payée Facturation Description Montant Développement pha… »

## Q06. Quel problème présente INV-003? Précisez le montant concerné et le traitement à prévoir.

**Réponse :** INV-003 (54 000 $) contient une ligne de 18 000 $ « Optimisation interface mobile - CR-04 ». CR-04 n'est pas approuvé : seuls les 36 000 $ du jalon 3 sont admissibles.

INV-003 du 22 sept., en validation : jalon 3 (36 000 $) + CR-04 (18 000 $) = 54 000 $ (INV-003 p.1). CR-04 est un brouillon sans numéro d'approbation ni signature (CR-04 p.1). Le comité n'a pris aucune décision de dépense (M04 L33-L35). CR-04 a été reporté en phase 2 avec l'interdiction de toute dépense sans nouvelle approbation (Decision_Portee_Phase2 L6 ; E10 L5). Nicolas a redit le 26 sept. : « Facturer du CR-04, non » (M06 L23). Le contrat exige une demande de changement approuvée avant exécution et facturation (contrat p.1). Les Finances ont signalé le problème le 23 sept. (E07 L5). Traitement recommandé : ne pas libérer INV-003 telle quelle ; Nicolas répond aux Finances qu'il n'y a pas d'approbation ; on demande à Boréal une facture corrigée ou une note de crédit de 18 000 $ ; on traite les 36 000 $ du jalon 3 après vérification du livrable (non documentée). Actions A-06 et A-07.

**Preuves :**

> `INV-003` · p.1 (05_Contrats_et_finances/INV-003.pdf) — « Document synthétique - Aucun fournisseur réel Page 1 FACTURE INV-003 Fournisseur Boréal Numérique Inc. 1450, rue des Ateliers, Montréal (QC) H3X 0A1 Numéro fournisseur fictif : BN-4481 Détails Facture INV-003 Projet NOVA Date 2026-09-22 Statut En validation Facturation Description Montant Développe… »
>
> `E07` · L5 (01_Courriels/E07_Facture_003_question.eml) — « Il y a une ligne de 18 000 $ « Optimisation interface mobile - CR-04 ». Peux-tu me transmettre l'approbation correspondante? Je trouve un brouillon de CR-04, mais rien qui indique qu'il a été approuvé. »
>
> `CR-04_Optimisation_mobile_BROUILLON` · p.1 (05_Contrats_et_finances/CR-04_Optimisation_mobile_BROUILLON.pdf) — « BROUILLON - Document fictif Page 1 DEMANDE DE CHANGEMENT CR-04 - BROUILLON Objet Optimisation avancée de l’expérience mobile pour écrans de moins de 768 px. Estimation Montant estimé 18 000 $ Statut BROUILLON - APPROBATION REQUISE Demande initiale 4 septembre 2026 Demandeur Boréal Numérique Note Au… »
>
> `Decision_Portee_Phase2` · L6 (06_Architecture_et_decisions/Decision_Portee_Phase2.md) — « La phase 1 doit demeurer utilisable sur mobile, mais les travaux d'optimisation avancée proposés par Boréal ne font pas partie de la portée approuvée de la phase 1. Aucune dépense additionnelle liée à CR-04 ne doit être engagée sans nouvelle approbation. »
>
> `M06` · L23 (02_Reunions/M06_Transcript_Comite_26sept.txt) — « 10:25 Nicolas : Regarder, oui. Facturer du CR-04, non. Il n'est pas approuvé. »

## Q07. Où les données de production doivent-elles être hébergées? Quelle preuve confirme la mise en œuvre?

**Réponse :** Au Canada, dans la région Canada Central (ADR-007, 23 juillet). Mise en œuvre : déclarée par Boréal le 26 août, puis vérifiée par l'équipe architecture (comité du 27 août).

Décision : atelier du 23 juillet (M02 L11-L17), formalisée dans l'ADR-007 (« Acceptée ») : production dans Canada Central, architecture v1 (East US) remplacée (ADR-007 L3-L10). Preuves de mise en œuvre : (1) Boréal annonce la migration complétée, avec un test de déploiement et de connectivité sans blocage (E03 L3-L5) et le schéma v2 « Canada Central » (Architecture_NOVA_v2 p.1). Le PDF joint à E03 est le même que le fichier séparé : ce n'est qu'une seule preuve, et elle vient du fournisseur. (2) Vérification indépendante : « déclarée terminée par Boréal et vérifiée par l'équipe architecture » (M03 L5). Cela répond à la conséquence de l'ADR-007 L15 (validation technique). Limite : le corpus ne contient pas de preuve technique brute (capture de console, inventaire des ressources) ; la vérification ne figure que dans le compte rendu.

**Preuves :**

> `ADR-007_Localisation_donnees` · L3-L15 (06_Architecture_et_decisions/ADR-007_Localisation_donnees.md) — « **Date de décision :** 23 juillet 2026 **Statut :** Acceptée ## Contexte L'architecture initiale de NOVA utilisait une région américaine. L'équipe sécurité demande que les données de production du projet demeurent au Canada. ## Décision L'environnement de production de NOVA sera déployé dans **Cana… »
>
> `M02` · L11-L17 (02_Reunions/M02_Transcript_Architecture_23juillet.txt) — « 09:06 Sophie : Pour moi, ce n'est pas juste une préférence. Les données de production NOVA doivent demeurer au Canada. Je veux qu'on le mette comme décision, pas comme note à revoir. 09:08 Julien : Aucun problème. On peut basculer le design. Il faudra quelques jours pour recréer les ressources et v… »
>
> `E03` · L3-L5 (01_Courriels/E03_Confirmation_Canada_Central.eml) — « La migration des ressources prévues pour NOVA vers Canada Central est complétée. Vous trouverez le schéma v2 en pièce jointe. Nous avons fait un test de déploiement et de connectivité hier soir. Aucun blocage identifié. »
>
> `M03` · L5 (02_Reunions/M03_CR_Comite_27aout.txt) — « - La migration de l'architecture vers Canada Central est déclarée terminée par Boréal et vérifiée par l'équipe architecture. »

## Q08. La sécurité est-elle acceptée? Distinguez livraison et validation.

**Réponse :** Non. Le correctif SEC-210 a été LIVRÉ le 19 sept., mais il n'est pas VALIDÉ : la sécurité n'a pas donné son acceptation et le ticket reste EN VALIDATION.

Défaut : la ligne d'audit EXPORT_CSV n'indique ni l'objet ni le résultat. Il s'agit d'une journalisation incomplète, pas d'une ligne absente (SEC-210 L17-L18 ; capture SEC-210_audit). Priorité « Bloquante avant production » (L5). Livraison : Boréal a déployé le correctif en validation le 19 sept., ses tests automatisés passent, et il le dit « réglé » (E08 L3 ; SEC-210 L23 ; Teams 19 sept. L4 ; M06 L6). Validation : Sophie, le 19 sept. : « Ne pas fermer avant validation sécurité » et « déployé != accepté » (SEC-210 L24 ; Teams L5). Le 26 sept. : re-test planifié, statut maintenu EN VALIDATION (L25). En comité, elle précise : « Nous n'avons pas encore donné l'acceptation sécurité » (M06 L7). Le « VERT » du rapport de statut du 21 sept. est prématuré (C-03). La capture montre l'état d'avant le correctif : à elle seule, elle ne prouve pas que le défaut persiste.

**Preuves :**

> `SEC-210` · L23-L25 (03_Tickets/SEC-210.txt) — « 19 sept 10:22 - Boréal : Fix déployé sur l'environnement de validation. Pour nous c'est réglé. 19 sept 14:05 - Sophie : Merci. Nous devons refaire notre scénario et confirmer nous-mêmes. Ne pas fermer avant validation sécurité. 26 sept 15:40 - Sophie : Re-test planifié. Statut maintenu EN VALIDATIO… »
>
> `E08` · L3 (01_Courriels/E08_Correctif_journalisation.eml) — « Le correctif pour SEC-210 est déployé en validation depuis ce matin. Nos tests automatisés passent et, pour nous, le problème est corrigé. »
>
> `M06` · L6-L7 (02_Reunions/M06_Transcript_Comite_26sept.txt) — « 10:01 Julien : Côté fournisseur, la build est stable. On a aussi livré le fix audit le 19. 10:02 Sophie : Attention à la formulation. Vous avez livré un fix. Nous n'avons pas encore donné l'acceptation sécurité de SEC-210. »
>
> `Teams_19sept_Securite` · L5 (07_Conversations_Teams/Teams_19sept_Securite.txt) — « 10:31 - Sophie : Merci. On garde le ticket en validation jusqu'à notre re-test. « déployé » != « accepté » :) »

## Q09. L'accessibilité est-elle complétée? Identifiez ce qui reste à corriger.

**Réponse :** Non. ACC-301 et ACC-302 sont fermés, mais ACC-303 est OUVERT (priorité Haute, bloquant) : dans la modale « Modifier le dossier », la touche Tab n'atteint jamais le bouton Enregistrer.

Fermés et validés : ACC-301, libellé manquant sur le champ Nom (validé avec NVDA et VoiceOver le 15 août, ACC-301 L14-L16) ; ACC-302, contraste du statut passé de 2,1:1 à 5,3:1, validé le 20 août (ACC-302 L14-L16). Reste à corriger : ACC-303 (build 2026.09.17). Le focus reste entre les champs Nom et Commentaire ; Enregistrer n'est jamais atteint avec Tab sur Chrome et Edge (ACC-303 L14 ; capture ACC-303_focus). Cause confirmée par Boréal : le composant modal intercepte le focus avec une liste incomplète d'éléments focusables (L15). Le 26 sept., le ticket est « Toujours ouvert. Correctif annoncé pour la prochaine build » (L16). Mélissa le considère bloquant avant production (M06 L9). Le « tout conforme » d'E04 (20 août) et le « VERT » du rapport du 21 sept. ne couvrent pas ACC-303 (C-05, C-03).

**Preuves :**

> `ACC-301` · L16 (03_Tickets/ACC-301.txt) — « 15 août - Mélissa : Validé avec NVDA et VoiceOver. Fermé. »
>
> `ACC-302` · L16 (03_Tickets/ACC-302.txt) — « 20 août - Mélissa : Re-test OK à 5,3:1. Fermé. »
>
> `ACC-303` · L14-L16 (03_Tickets/ACC-303.txt) — « 17 sept 13:14 - Mélissa : Reproduit sur Chrome et Edge. Le focus reste entre le champ Nom et Commentaire; le bouton Enregistrer n'est jamais atteint avec Tab. 18 sept 09:50 - Boréal : On a reproduit. Le composant modal intercepte le focus avec une liste d'éléments focusables incomplète. 26 sept 11:… »
>
> `ACC-303_focus` · capture (03_Tickets/ACC-303_focus.png) — « [capture] Bandeau : NOVA — Build 2026.09.17 — https://nova.demo.local Titre de page : Fenêtre de modification Modale « Modifier le dossier » : champ « Nom du demandeur » (Camille Roy), champ « Commentaire », bouton « Enregistrer » encadré en rouge Annotation en rouge : « Le focus clavier ne rejoint… »
>
> `M06` · L9 (02_Reunions/M06_Transcript_Comite_26sept.txt) — « 10:05 Mélissa : Il reste ACC-303. La modale ne permet toujours pas d'atteindre Enregistrer au clavier. Pour moi c'est un bloquant d'accessibilité avant production. »

## Q10. Quelles sont les trois conditions de go-live? Précisez les travaux manquants du runbook à partir de sa capture.

**Réponse :** (1) Validation sécurité de SEC-210, (2) fermeture d'ACC-303, (3) approbation du runbook incluant le retour arrière. Selon la capture, il manque l'étape 4 « Procédure de retour arrière » (TODO) et l'étape 5 « Validation fonctionnelle post-déploiement » (À compléter).

Les trois conditions ont été formulées par Nicolas et confirmées par Sophie, Mélissa et Olivier le 26 sept. (M06 L11-L14). Capture du runbook (OPS-601_runbook, « Version du 25 septembre ») : étapes 1 à 3 OK (santé des services, mode maintenance, déploiement de la version approuvée) ; étape 4, Procédure de retour arrière : TODO ; étape 5, Validation fonctionnelle post-déploiement : À compléter. Olivier : « Il manque au minimum la procédure de rollback. La capture jointe identifie aussi une autre étape à compléter. » Il veut une procédure qu'une autre personne peut exécuter sans appeler l'équipe projet (OPS-601 L14). Le 29 sept., il n'a « toujours pas reçu la version finale » (L16). Responsables : Sophie (GL-1), Boréal puis Mélissa (GL-2), Boréal ops puis Olivier (GL-3). Aucune échéance n'est documentée : à confirmer (A-01 à A-05).

**Preuves :**

> `M06` · L11-L14 (02_Reunions/M06_Transcript_Comite_26sept.txt) — « 10:09 Nicolas : Donc trois conditions concrètes : validation sécurité de SEC-210, fermeture de ACC-303 et approbation du runbook incluant rollback. Exact? 10:10 Sophie : Oui. 10:10 Mélissa : Oui. 10:10 Olivier : Oui. »
>
> `OPS-601_runbook` · capture (03_Tickets/OPS-601_runbook.png) — « [capture] Bandeau : NOVA — Version du 25 septembre — https://nova.demo.local Titre de page : Runbook de mise en production 1. Vérifier la santé des services — OK 2. Activer le mode maintenance — OK 3. Déployer la version approuvée — OK 4. Procédure de retour arrière — TODO 5. Validation fonctionnel… »
>
> `OPS-601` · L14-L16 (03_Tickets/OPS-601.txt) — « 25 sept - Olivier : Il manque au minimum la procédure de rollback. La capture jointe identifie aussi une autre étape à compléter. J'ai besoin de quelque chose qu'une autre personne peut exécuter sans appeler l'équipe projet. 26 sept - Nicolas : D'accord. Ceci fait partie des conditions de go-live d… »
