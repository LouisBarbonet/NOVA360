# Brief de reprise — NOVA au 30 septembre 2026

*Baseline — état au 30 septembre 2026, 09:00 (Montréal)*

**Responsable.** Nicolas Perron, chargé de projet depuis le 16 sept. 2026 (Élodie Caron avant lui). — preuves : `E06 L3`

**Date approuvée et conditions.** 22 oct. 2026, approuvée par le comité de direction le 10 sept. (proposée par Boréal le 8 sept.). Ce n'est PAS un go garanti : trois conditions sont ouvertes, à savoir la validation sécurité de SEC-210, la fermeture d'ACC-303 et l'approbation du runbook avec retour arrière. — preuves : `M04 L17-L23`, `M06 L11-L16`

**Portée.** Phase 1 : SSO, création et suivi de demandes, pièces jointes, workflow, tableau de suivi, rapports standards, plus rapports avancés (CR-01). Le mobile avancé (CR-04) est reporté en phase 2 et n'est pas approuvé. Les données de production sont dans Canada Central (ADR-007). — preuves : `CONTRAT_Boreal_NOVA p.1`, `Decision_Portee_Phase2 L4`, `ADR-007_Localisation_donnees L10`

**Budget.** Autorisé : 204 000 $ (180 000 $ du contrat + 24 000 $ de CR-01). Payé : 132 000 $. En validation : 54 000 $. Contrat jusqu'au 31 oct. — preuves : `CONTRAT_Boreal_NOVA p.1`, `CR-01_Rapports_avances_APPROUVE p.1`

**Factures.** INV-001 (60 000 $) et INV-002 (72 000 $) sont payées. INV-003 (54 000 $) est bloquée : sa ligne de 18 000 $ pour CR-04 n'est pas autorisée. Il faut demander une facture corrigée et ne traiter que les 36 000 $ du jalon 3. — preuves : `INV-003 p.1`, `E07 L5`

**Priorités.** 1) Obtenir la date du re-test SEC-210 (Sophie). 2) Obtenir la date de la build ACC-303 de Boréal, puis le re-test de Mélissa. 3) Obtenir le runbook avec retour arrière et validation post-déploiement (Boréal ops, puis approbation d'Olivier). 4) Répondre aux Finances sur INV-003. 5) Corriger le plan v3, le registre (R-01), le rapport de statut et le brouillon de communication « au vert ». — preuves : `M06 L11-L15`, `OPS-601 L16`, `E11 L5`

## Conditions de go-live → actions

| Condition | Statut | Actions · responsable · échéance | Preuves |
|---|---|---|---|
| **GL-1** Validation sécurité de SEC-210 | Correctif livré le 19 sept. ; re-test planifié le 26 sept., date non précisée ; statut EN VALIDATION | A-01 Sophie Lambert — *à confirmer (« re-test planifié », date non indiquée)* | `M06 L11`, `SEC-210 L25` |
| **GL-2** Fermeture d'ACC-303 (focus clavier dans la modale) | OUVERT ; correctif annoncé « pour la prochaine build », sans date | A-02 Boréal (Julien Moreau) — *à confirmer (« prochaine build »)*<br>A-03 Mélissa Gagnon — *à confirmer (dépend de A-02)* | `M06 L11`, `ACC-303 L16` |
| **GL-3** Approbation du runbook, incluant le retour arrière | OUVERT ; étape 4 (retour arrière) TODO, étape 5 (validation post-déploiement) À compléter ; aucune version finale reçue au 29 sept. | A-04 Boréal (équipe ops, relancée par Julien Moreau) — *à confirmer — Olivier veut le runbook final « quelques jours avant » ; le plan v3 fait finir P-05 le 10 oct.*<br>A-05 Olivier Côté — *à confirmer* | `M06 L10-L11`, `OPS-601_runbook capture`, `OPS-601 L16` |
