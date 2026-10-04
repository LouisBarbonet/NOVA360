# Plan de répétition — présentation NOVA 360

**Durée totale : environ 1 h 30.** Aucun quota Gemini n'est consommé, sauf pendant la passe 4, qui est facultative. Support : `devpost/aide-memoire.pdf` imprimé (une copie par personne).

## Rôles (à adapter à la taille de l'équipe)

| Rôle | Qui | Responsabilité |
|---|---|---|
| **Narrateur** | … | Pitch, problème, fil du récit, conclusion. Énonce les limites. |
| **Pilote** | … | Seul·e au clavier. Navigue sans chercher : connaît chaque clic par cœur. |
| **Relecteur** | … | Nouvel événement : téléverse, lit le brouillon à voix haute, applique les 3 règles, enregistre. Plan B si l'IA échoue. |
| **Jury fictif** | (en répétition) | Chronomètre, interrompt, pose les questions de la passe 3. |

## 0. Mise en place (10 min)

1. `npm run dev` dans un terminal, puis `npm run verif` : tout doit être au vert.
2. Ouvrir deux onglets : le **site en ligne** (https://louisbarbonet.github.io/NOVA360/) et la page **Mise à jour en local** (http://localhost:5173/#/mise-a-jour).
3. Préparer un chronomètre visible et l'aide-mémoire imprimé.

## Passe 1 — à blanc, avec arrêts (25 min)

Suivre le déroulé de l'aide-mémoire, étape par étape. **On s'arrête à chaque étape** pour vérifier trois choses :
- le **clic exact** du pilote (noter l'onglet et le lien à utiliser) ;
- la **phrase clé** du narrateur ;
- ce que le jury doit **voir à l'écran** à ce moment-là.

| Temps | Étape | Phrase clé | À l'écran |
|---|---|---|---|
| 0:00 | Problème | « 64 fichiers qui se contredisent ; le vrai risque, c'est de se fier à la mauvaise information. » | Brief |
| 0:30 | Brief | « Une page : responsable, date et conditions, budget, factures, priorités. Chaque phrase est sourcée. » | Brief + tableau des conditions |
| 1:15 | Q10 → preuve | « Chaque réponse cite un fichier et un repère : voici la capture du runbook. » | Capture : étape 4 TODO, étape 5 « À compléter » |
| 2:00 | Contradiction C-02 | « Le fichier est daté du 29, mais la ligne date du 9 : on tranche par la date des faits. » | Page Contradictions |
| 2:45 | Chronologie Sécurité | « Livré n'est pas validé. » | Fil Sécurité filtré |
| 3:15 | Chat | « Qui a approuvé CR-04 ? Personne, et il le prouve. » | Réponse pré-enregistrée |
| 3:45 | Nouvel événement | « Téléverser, analyser, relire, enregistrer. Le baseline reste intact. » | Formulaire, puis brouillon, puis U1 |
| 5:45 | Limites et conclusion | Le pitch. | Brief |

**Pour l'étape 3:45 en répétition**, on ne consomme pas de quota :
1. Le relecteur ouvre `repetitions/repetition-2/U1_gemini_runbook_recu.json` dans un éditeur et le **lit à voix haute** comme s'il s'agissait du brouillon : que dit l'événement, que change-t-il, et qu'est-ce qui reste inchangé ?
2. Le pilote lance `npm run repetition:charger`, recharge la page et montre la bascule **Baseline ↔ U1**, l'encadré violet du brief, le thème « révisé · U1 » et la capture jointe marquée « à relire ».
3. À la fin : `npm run repetition:reset`.

## Passe 2 — chronométrée, en conditions réelles (15 min)

- Enchaîner sans s'arrêter. Objectif : **6 minutes**, 6 min 30 au maximum.
- Le jury fictif interrompt une fois, au hasard, avec « Montrez-moi la preuve de … ». Le pilote doit l'afficher en **moins de 15 secondes** (passer par la page Q01–Q10 ou par la recherche).
- Noter chaque hésitation ; on la corrige pendant le débrief.

## Passe 3 — questions du jury (20 min)

Le jury fictif pose ces questions, dans le désordre. Les réponses sont dans l'aide-mémoire, mais on doit pouvoir y répondre **sans lire**.

**Sur la fiabilité**
- Comment savez-vous que vos réponses sont justes ? *(278 citations vérifiées automatiquement, relecture humaine, preuves cliquables.)*
- Montrez-moi la preuve de Q07. Pourquoi E03 seul ne suffit-il pas ? *(La pièce jointe est identique au fichier séparé, et c'est le fournisseur qui l'affirme ; la vérification indépendante vient de M03.)*
- Pourquoi 204 000 $ et pas 222 000 $ ? *(CR-04 n'est qu'un brouillon : il n'est pas autorisé.)*
- Que faites-vous quand deux sources se contredisent ? *(Autorité de la source et date des faits, jamais la date du fichier ; exemples C-01 et C-02.)*

**Sur l'IA**
- Et si l'IA invente ? *(Validateur, citation rouge, garde-fous, relecture ; cas réel : 3 repères inventés détectés.)*
- Qu'avez-vous fait à la main ? *(Transcription relue des captures, relecture de la mémoire et des réponses pré-enregistrées.)*
- Pourquoi pas de RAG ? *(Le corpus tient dans le contexte : rien n'est oublié.)*
- Que se passe-t-il si Gemini tombe pendant la démo ? *(Bascule entre modèles, puis plan B manuel ; les réponses pré-enregistrées et l'export hors ligne restent disponibles.)*

**Sur l'événement**
- Que faites-vous si l'événement est une capture d'écran ? *(Transcription automatique marquée « à relire » et relue contre l'image.)*
- Et si l'événement contredit une décision du comité ? *(Proposition ≠ décision : la décision antérieure reste en vigueur et une action « faire trancher » est créée.)*

**Exercice de réflexe** : pour chacun de ces événements possibles, le relecteur dit en 20 secondes ce qui change et ce qui ne change pas :
1. Boréal **propose** le 29 octobre → proposition seulement ; le 22 reste approuvé ; risque contractuel (fin du contrat le 31).
2. Sophie **accepte** SEC-210 → GL-1 fermée ; GL-2 et GL-3 inchangées ; Q08 mise à jour.
3. Boréal **livre** le correctif ACC-303 → livré ≠ validé : GL-2 reste ouverte jusqu'au re-test de Mélissa.
4. Facture INV-003 **corrigée** (36 000 $) → Q06 et budget mis à jour ; aucune condition de go-live touchée.
5. Le comité **reporte** au 29 octobre → décision : Q01, Q03 et le brief changent ; les 3 conditions restent ouvertes.

## Passe 4 — plan B, puis un vrai essai si le quota le permet (15 min)

1. **Plan B (sans quota)** : le relecteur ouvre `repetitions/modele-plan-B.json` et s'entraîne à adapter ce brouillon manuel à l'exemple n° 3 ci-dessus (ACC-303 livré). Objectif : un JSON valide en **moins de 4 minutes**.
2. **Facultatif, une seule fois** : un vrai téléversement (variante « fichiers » de la partie 7 du guide de tests) pour vivre l'attente d'environ 45 secondes. Ce que le narrateur dit pendant l'attente : *« Le système extrait les pièces jointes, transcrit la capture, puis le LLM rédige un brouillon ; des garde-fous retirent tout ce qui ne cite pas la nouvelle source. »* Ensuite, `npm run repetition:reset`.

## Débrief (10 min)

- Les 3 hésitations les plus longues : quel clic, quelle phrase change ?
- Vérifier que les **3 limites** sont dites spontanément par le narrateur.
- Vérifier que la démo tient en **6 minutes**.

## Après la démo (consigne Loto-Québec : résultats finaux dans le dépôt)

```
npm run package        # régénère livrables/U1/, RESULTATS.md et le zip
npm run worker:deploy  # le chat en ligne connaît la nouvelle version
git add -A && git commit -m "Résultats après la nouvelle information (U1)" && git push
```

## Juste avant de monter

```
npm run repetition:reset   # si une répétition est restée chargée
npm run verif              # tout doit être au vert
```

Ne plus toucher au `.env` (le serveur redémarrerait). Garder le zip à portée de main en cas de problème réseau.
