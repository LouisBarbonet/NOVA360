# Guide de tests manuels — NOVA 360

Durée : environ 60 à 90 minutes pour tout faire. Les parties **1 à 4** sont les plus importantes, parce qu'elles correspondent au barème.
Pour chaque test, cochez ✅ ou ❌. Pour chaque ❌, notez ce que vous avez vu (voir le modèle de feedback à la fin).

---

## 0. Préparation (5 min)

1. **Lancer l'app** : dans un terminal, depuis le dossier du projet, lancez `npm run dev`, puis ouvrez http://localhost:5173.
   - Si le port 5173 est déjà pris, le serveur tourne déjà (lancé par Claude) : ouvrez simplement l'URL.
2. **Vérifier le fournisseur du chat** : le fichier `.env` doit contenir `NOVA_PROVIDER=gemini` et votre clé.
3. **Garder le corpus brut ouvert** à côté (`NOVA_ETUDIANTS/Projet360_NOVA_ETUDIANTS/`). Le but est de vérifier que ce que dit l'app correspond **vraiment** aux fichiers d'origine, pas seulement que l'app « a l'air » juste.
4. Le sélecteur **Version** (en haut à droite) doit afficher « Baseline — état au 30 septembre 2026, 09:00 ».

---

## 1. Les dix questions Q01–Q10 (≈ 30 min, 50 points du barème)

**Méthode pour chaque question** :
1. Ouvrez la page **Q01–Q10** et lisez la réponse courte, puis le détail.
2. Comparez-les aux **points attendus** ci-dessous.
3. Cliquez **au moins une preuve** : le passage doit s'ouvrir **surligné** et dire la même chose que la réponse.
4. Pour les questions marquées 🔎, ouvrez aussi le **fichier brut** dans le dossier du corpus.
5. Vérifiez qu'**aucun piège** n'est tombé.

### Q01 — Date approuvée et réserve
- [ ] La réponse dit **22 octobre 2026**.
- [ ] Elle précise que ce n'est **pas un go garanti** : la date est conditionnelle à **3 conditions** (validation SEC-210, fermeture ACC-303, runbook avec retour arrière).
- [ ] La preuve `M04 L17-L23` montre « Donc approuvé » ; `M06 L11-L16` montre les 3 conditions.
- ⚠ Piège : répondre « 15 octobre » (plan v3 périmé), ou présenter le 22 comme certain.

### Q02 — Pourquoi la date a changé, et état de la cause
- [ ] Cause : le **connecteur interne (INT-101)**, qui était sur le chemin critique (jeton expiré, erreurs 401).
- [ ] État : **résolu**. INT-101 a été fermé le **17 sept.** après 120 recherches sur 120 valides.
- [ ] La réponse signale que le **registre des risques du 29 sept.** indique encore R-01 « Ouvert », et que c'est périmé.
- 🔎 Ouvrez `03_Tickets/INT-101.txt` (lignes 17-18), puis `04_Documents_projet/Registre_Risques_29sept.xlsx` (cellules F2, H2).
- ⚠ Piège : dire que le connecteur est encore un problème parce que le registre est daté du 29.

### Q03 — Qui a approuvé, et quand (proposition ≠ approbation)
- [ ] **Proposition** : Boréal (Julien Moreau), le **8 sept.** (courriel E05).
- [ ] **Approbation** : le **comité de direction**, le **10 sept.** La décision est formulée par Élodie Caron, sans objection.
- ⚠ Piège : dire que Boréal a décidé, ou que la décision date du 8 septembre.

### Q04 — Responsable et depuis quand
- [ ] **Nicolas Perron**, depuis le **16 sept. 2026** ; avant lui, Élodie Caron.
- ⚠ Piège : répondre Élodie, ce qu'indique la charte v1, qui n'est pas mise à jour.

### Q05 — Montant contractuel autorisé et calcul 🔎
- [ ] **204 000 $** = 180 000 $ (contrat) + 24 000 $ (CR-01 approuvé).
- [ ] CR-04 (18 000 $) **n'est pas inclus** : c'est un brouillon.
- [ ] La réponse distingue l'**autorisé** (204 000 $), le **payé** (132 000 $) et ce qui est **en validation** (54 000 $).
- 🔎 Ouvrez le PDF `CONTRAT_Boreal_NOVA.pdf` et `CR-01_Rapports_avances_APPROUVE.pdf`.
- ⚠ Piège : 222 000 $ (CR-04 compté) ou 180 000 $ (CR-01 oublié) ; compter la facture INV-778 du projet ORION.

### Q06 — Problème d'INV-003 🔎
- [ ] INV-003 (54 000 $) contient une ligne de **18 000 $ pour CR-04**, qui **n'est pas approuvé**.
- [ ] Traitement proposé : ne pas libérer la facture telle quelle, demander une facture corrigée ou une note de crédit, ne traiter que les **36 000 $** du jalon 3.
- [ ] La réponse dit que ce traitement est une **recommandation** de l'équipe, pas un engagement documenté.
- 🔎 Ouvrez `INV-003.pdf` et `CR-04_Optimisation_mobile_BROUILLON.pdf`.

### Q07 — Hébergement et preuve de mise en œuvre
- [ ] **Canada Central** (décision ADR-007 du 23 juillet).
- [ ] Preuve de mise en œuvre : migration **déclarée par Boréal** (courriel E03 + schéma v2), puis **vérifiée par l'équipe architecture** (M03).
- [ ] La réponse note que le PDF joint à E03 = le fichier séparé : **ce n'est pas une confirmation indépendante**.
- ⚠ Piège : East US (architecture v1, remplacée).

### Q08 — La sécurité est-elle acceptée? (livraison ≠ validation)
- [ ] **Non**. Le correctif SEC-210 a été **livré** le 19 sept., mais il n'est **pas validé** : le ticket est EN VALIDATION et le re-test sécurité n'est pas fait.
- [ ] Le « VERT » du rapport de statut du 21 sept. est présenté comme **prématuré**.
- 🔎 Ouvrez la capture `03_Tickets/SEC-210_audit.png` : elle montre l'état **avant** le correctif.
- ⚠ Piège : répondre « oui, corrigé » en se fiant à Boréal (courriel E08) ou au rapport de statut.

### Q09 — L'accessibilité est-elle complétée?
- [ ] **Non**. ACC-301 (libellés) et ACC-302 (contraste) sont **fermés et validés**.
- [ ] **ACC-303 est OUVERT** : avec Tab, impossible d'atteindre le bouton « Enregistrer » dans la modale. C'est bloquant.
- [ ] La réponse s'appuie sur le ticket (commentaire du 26 sept.) et sur M06, pas seulement sur la capture.
- ⚠ Piège : « complétée » (courriel E04 « tout conforme », ou rapport de statut).

### Q10 — Trois conditions de go-live et travaux manquants du runbook 🔎
- [ ] Les 3 conditions : **validation sécurité SEC-210**, **fermeture d'ACC-303**, **approbation du runbook avec retour arrière**.
- [ ] Il manque au runbook : l'**étape 4 « Procédure de retour arrière » (TODO)** et l'**étape 5 « Validation fonctionnelle post-déploiement » (À compléter)**.
- 🔎 Cliquez la preuve `OPS-601_runbook capture` : la vraie capture doit s'afficher, avec sa transcription.

---

## 2. Brief, preuves et navigation (≈ 10 min)

- [ ] **Brief** : il couvre les 5 thèmes (responsable, date et conditions, portée, budget, factures, priorités).
- [ ] Le tableau « Conditions de go-live → actions » relie chaque condition à un responsable et à une échéance (« à confirmer » si elle est inconnue).
- [ ] **Imprimer / PDF** : l'aperçu tient sur **une seule page**.
- [ ] **Preuve PDF** : sur la page Budget et factures, cliquez `INV-003 p.1`, puis « Ouvrir le PDF original ».
- [ ] **Preuve Excel** : sur la page Contradictions (C-01), cliquez `Plan_Projet_NOVA_v3_12sept Plan projet!E7` ; la cellule **E7=2026-10-15** doit être surlignée.
- [ ] **Pièce jointe** : sur la page Sources, ouvrez E07. La pièce jointe doit indiquer « = INV-003 (même document, pas une preuve indépendante) ».
- [ ] **← Retour** ramène à la page précédente.

## 3. Chronologie, décisions et contradictions (≈ 10 min)

- [ ] **Chronologie** : filtrez « proposition », puis « décision », puis « validation ». Les événements sont cohérents (8 sept. = proposition ; 10 sept. = décision).
- [ ] Filtrez le sujet **Sécurité** : 12 sept. → 19 sept. (livraison) → 21 sept. (rapport prématuré) → 26 sept. (acceptation non donnée).
- [ ] **Contradictions** : C-01 (plan v3 contre comité) et C-02 (registre du 29 sept. contre ticket INT-101) sont expliquées par l'**autorité** ou la **date des faits**.
- [ ] **Dossier de décisions** : cliquez D-04. Vous voyez la proposition d'E05, la décision M04 et la chaîne des faits, avec les extraits.

## 4. Actions, risques et finances (≈ 5 min)

- [ ] **Actions et risques** : le filtre « Engagements documentés » et le filtre « Recommandations de notre équipe » donnent des listes différentes et cohérentes.
- [ ] Chaque action a un **responsable** (proposé ou confirmé), une **échéance** (ou « à confirmer ») et une **preuve**.
- [ ] Les **informations manquantes** sont listées (date du re-test SEC-210, date de la build ACC-303, échéance du runbook…).
- [ ] **Budget et factures** : Autorisé 204 000 $ · Payé 132 000 $ · En validation 54 000 $ · Sans autorisation 18 000 $ ; INV-778 (ORION) est exclue.

## 5. Recherche (≈ 3 min)

Essayez : `rollback`, `retour arriere` (sans accent), `Canada Central`, `CR-04`, `22 octobre`.
- [ ] Les résultats sont pertinents, et chaque résultat ouvre le passage surligné.

## 6. Chat en langage naturel (≈ 10 min ; chaque question consomme du quota Gemini)

Réponse en 10 à 30 secondes. Vérifiez : la justesse, les citations cliquables (une citation **rouge** = repère introuvable, à signaler), et l'absence d'invention.

**Questions d'exemple** (boutons de la page) : faites-en 2 ou 3.

**Questions pièges** (tapez-les) : la bonne réponse est indiquée.
- [ ] « Le 22 octobre est-il garanti? » → **Non**, conditionnel à 3 éléments.
- [ ] « SEC-210 est-il fermé? » → **Non** : livré, pas accepté.
- [ ] « Qui a approuvé CR-04? » → **Personne** : c'est un brouillon, reporté en phase 2.
- [ ] « Quel est le budget du projet ORION? » → il doit dire que c'est **hors du projet NOVA** et ne rien inventer.
- [ ] « Quelle est la date du re-test de SEC-210? » → **non documentée**.
- [ ] **Cache** : reposez une question déjà posée, en changeant la casse ou le « ? ». La réponse doit être instantanée, avec la mention « ⚡ réponse en cache : aucun quota consommé ».

## 7. Arrivée d'un nouvel événement (≈ 10 min ; 1 analyse = 1 à 3 requêtes Gemini)

1. Page **Mise à jour** → titre : `TEST Sophie 2 octobre` → collez ce texte :

   ```
   Date: Fri, 02 Oct 2026 14:05:00 -0400
   From: Sophie Lambert <sophie.lambert@demo.example>
   To: nicolas.perron@demo.example
   Subject: SEC-210 - re-test sécurité

   Bonjour Nicolas,
   Nous avons refait notre scénario d'export CSV sur l'environnement de validation.
   L'événement EXPORT_CSV contient maintenant l'utilisateur, l'horodatage, l'identifiant du dossier et le résultat.
   Je donne l'acceptation sécurité de SEC-210. Le ticket peut être fermé.
   Sophie
   ```
2. Cliquez « Ingérer et analyser l'impact » et attendez environ 1 minute.
3. **Relisez le brouillon JSON** :
   - [ ] GL-1 (sécurité) passe à **accepté**, avec la nouvelle source comme preuve.
   - [ ] **GL-2 (ACC-303) et GL-3 (runbook) restent ouverts** : ils doivent figurer dans « unchanged ».
   - [ ] La date reste le 22 oct. Aucune approbation de go-live n'est inventée.
   - [ ] Q08 est mise à jour (sécurité acceptée le 2 oct.).
4. Enregistrez, puis basculez le sélecteur **Version** entre Baseline et U1 :
   - [ ] En Baseline, rien n'a changé (Q08 = « Non »).
   - [ ] En U1, l'encadré violet des changements apparaît en haut du brief, et Q08 est marquée « modifié · U1 ».

### ⚠ Remise à zéro après ce test (obligatoire avant la vraie démo)
Dans un terminal Git Bash, depuis le projet :
```
rm -f data/memory/updates/*.json
rm -rf NOVA_ETUDIANTS/Projet360_NOVA_ETUDIANTS/09_Nouvel_evenement
git checkout data/corpus.json
npm run validate
```
Le sélecteur de version ne doit plus proposer que le Baseline (rechargez la page).

## 8. Export autonome pour le jury (≈ 3 min)

1. Lancez `npm run package`, puis décompressez `NOVA360_remise.zip` dans un dossier temporaire.
2. Double-cliquez `dist/index.html`, **sans serveur**.
   - [ ] Le brief, Q01–Q10, les preuves surlignées, les captures et la recherche fonctionnent.
   - [ ] Le chat affiche un message « indisponible dans cet export », sans planter.
   - [ ] `livrables/baseline/1_BRIEF.pdf` s'ouvre et tient sur une page.

---

## Modèle de feedback

Copiez ce bloc par problème trouvé et renvoyez-le à Claude :

```
Test : (ex. Q05 / Chronologie / Chat question piège ORION)
Attendu : ...
Observé : ...
Gravité : bloquant / gênant / cosmétique
Capture ou texte exact : ...
```
