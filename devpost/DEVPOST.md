# Texte Devpost final — NOVA 360

> Un bloc par champ Devpost. Copier le contenu **sous** chaque titre de champ.
> Captures : `devpost/captures/`, dans l'ordre du tableau ci-dessous (légende à coller dans chaque image).

---

## Champ « Elevator pitch » / tagline (176 / 200 caractères)

Reprendre un projet sans se fier à la mauvaise info : NOVA 360 relie chaque réponse à sa preuve, tranche les contradictions et intègre les nouveautés sans effacer l'historique.

---

## Galerie d'images (ordre et légendes)

| Fichier | Légende |
|---|---|
| `01-brief.png` | Brief de reprise d'une page : responsable, date approuvée et conditions, portée, budget, factures, priorités. Chaque phrase renvoie à sa preuve. |
| `02-questions-q01-q10.png` | Les dix questions du défi : réponse courte, nuances, puis preuves cliquables (fichier + repère). |
| `03-preuve-surlignee.png` | Un clic sur une preuve ouvre le fichier source au passage surligné : l'approbation du 22 octobre en comité (M04, lignes 17 à 23). |
| `04-capture-transcrite.png` | Les captures d'écran sont des preuves à part entière : le runbook et sa transcription (retour arrière « TODO », validation « À compléter »). |
| `05-cellule-excel.png` | Preuve au niveau de la cellule Excel : le plan v3 indique encore le 15 octobre (cellule E7), une information périmée. |
| `06-chronologie.png` | Chronologie filtrable qui distingue proposition, décision, livraison et validation (ici, le fil Sécurité). |
| `07-dossier-decisions.png` | Dossier de décisions : qui a proposé, qui a décidé, pourquoi, et la chaîne des faits avec l'extrait exact de chaque preuve. |
| `08-contradictions.png` | Contradictions tranchées par l'autorité de la source ou la date des faits, jamais par la date du fichier. |
| `09-actions-risques.png` | Actions restantes : responsable, échéance (ou « à confirmer »), preuve, et distinction entre engagement documenté et recommandation de l'équipe. |
| `10-budget-factures.png` | Budget : autorisé, payé, en validation et facturé sans autorisation (CR-04 sur INV-003). |
| `11-sources.png` | Le corpus complet ; doublons, bruit et historique sont signalés et jamais comptés comme preuves indépendantes. |
| `12-recherche.png` | Recherche plein texte, tolérante aux accents. |
| `13-mise-a-jour-avant-apres.png` | Après un nouvel événement : ce qui change (avant / après), ce qui est affecté, ce qui ne change pas, avec les preuves. *(Répétition avec un événement simulé.)* |
| `14-brief-apres-evenement.png` | Le brief de la nouvelle version, avec l'encadré des changements ; le baseline reste intact et consultable. *(Répétition.)* |
| `15-q01-modifiee-u1.png` | Les réponses touchées par l'événement sont marquées « modifié · U1 ». *(Répétition.)* |
| `16-chat-question-piege.jpg` | Chat en langage naturel avec citations cliquables : à « Qui a approuvé CR-04? », il répond « Personne » et le prouve. |

---

## Champ « Inspiration »

Reprendre un projet en cours, c'est souvent hériter de courriels, de comptes rendus, de tickets, de factures et de plans qui ne disent pas tous la même chose. Dans NOVA, le plan projet du 12 septembre annonce encore le 15 octobre, alors que le comité a approuvé le 22 octobre deux jours plus tôt. Un rapport de statut affiche la sécurité « au vert », alors que le correctif n'est que livré, pas accepté. Une facture contient 18 000 $ pour une demande de changement restée à l'état de brouillon.

Le vrai risque n'est pas le manque d'information : c'est de se fier à la mauvaise. Notre objectif : une mémoire de projet sur laquelle une équipe peut **réellement s'appuyer**. Chaque affirmation y pointe vers sa preuve, et l'on y distingue toujours une proposition d'une décision, et une livraison d'une validation.

---

## Champ « What it does »

**NOVA 360** transforme les 64 fichiers du dossier (courriels, transcriptions de réunions, tickets, captures d'écran, PDF, classeurs Excel) en une mémoire opérationnelle consultable, sourcée, et mise à jour sans perdre l'historique.

- **Brief de reprise d'une page**, imprimable : responsable, date approuvée et conditions, portée, budget, factures, priorités. Les trois conditions de go-live sont reliées à leurs actions, responsables et échéances.
- **Réponses aux dix questions du défi**, chacune avec le fichier source, un repère précis (ligne, page, cellule, capture) et l'extrait exact. Par exemple :
  - la mise en production est fixée au **22 octobre 2026**, mais ce n'est **pas un go garanti**. Elle reste conditionnelle à la validation sécurité de SEC-210, à la fermeture d'ACC-303 et à l'approbation du runbook avec retour arrière ;
  - le montant autorisé est de **204 000 $** (180 000 $ du contrat + 24 000 $ du CR-01 approuvé). Les 18 000 $ de CR-04 facturés sur INV-003 ne sont pas autorisés.
- **Mémoire consultable :**
  - 35 événements datés, typés proposition / décision / livraison / validation ;
  - 7 décisions justifiées ;
  - **8 contradictions résolues** ;
  - 13 actions (5 engagements documentés, 8 recommandations de l'équipe, toujours distinguées) ;
  - 4 risques principaux ;
  - 8 informations manquantes, déclarées comme telles, sans échéance ni approbation inventée.
- **Preuves navigables :** chaque citation ouvre le fichier d'origine au passage surligné. Les pièces jointes dupliquées et le bruit (facture d'un autre projet, notes anonymes) sont signalés et ne comptent jamais comme confirmations indépendantes.
- **Dossier de décisions :** pour chaque décision, la chaîne complète des preuves avec leurs extraits.
- **Recherche plein texte** et **chat en langage naturel** qui cite ses sources. Une citation dont le repère n'existe pas s'affiche en rouge.
- **Intégration d'une nouvelle information, dans n'importe quel format du corpus**, par téléversement (courriel, PDF, Excel, capture d'écran, texte) :
  - les pièces jointes d'un courriel deviennent des sources citables ;
  - les captures sont transcrites automatiquement et marquées « à relire » ;
  - l'application montre ce qui change (avant / après), les éléments affectés, ce qui ne change pas, les actions touchées, et produit un **brief révisé**.
  - **Le baseline n'est jamais modifié** : un sélecteur de version compare l'état initial et l'état actualisé.
- **Exports :** pour chaque version, le brief en PDF d'une page, ainsi que les réponses, la mémoire et le dossier de décisions en Markdown.

---

## Champ « How we built it »

Une approche **« preuve d'abord »** : chaque fait de la mémoire est une citation vérifiable, et c'est la machine qui vérifie que la preuve existe.

1. **Extraction du corpus** (TypeScript) :
   - courriels MIME décodés, pièces jointes comprises ;
   - PDF découpés par page ;
   - classeurs Excel lus cellule par cellule, commentaires compris ;
   - les 8 captures d'écran du dossier transcrites puis relues.
2. **Mémoire structurée** (JSON) : brief, réponses, chronologie, décisions, contradictions, actions, risques, finances, informations manquantes. Rédigée avec l'aide de Claude Code, puis relue par l'équipe contre les sources.
3. **Validation automatique :** un script vérifie que **chacune des 278 citations** pointe vers une ligne, une page, une cellule (ou une plage) ou une capture qui existe vraiment. **43 tests automatisés** couvrent le rendu des pages, le surlignage des preuves, la cohérence des montants, l'extraction de chaque format et la superposition des mises à jour.
4. **Application web** (Vite + TypeScript, sans framework), compilée en **un seul fichier HTML** qui fonctionne aussi hors ligne.
5. **Mises à jour superposées :** chaque événement produit une couche datée (U1, U2…) fusionnée au-dessus du baseline, qui reste intact.
   - Un LLM rédige un **brouillon** d'impact.
   - Des **garde-fous déterministes** retirent ensuite tout élément identique au baseline, déclaré « inchangé », ou modifié **sans citer la nouvelle source**.
   - L'équipe relit le brouillon avant de l'enregistrer, et les citations sont revalidées automatiquement.
   - Si l'IA est indisponible, les sources restent ingérées et un brouillon vide est proposé pour une saisie manuelle.
6. **Chat :** pas de base vectorielle. Le corpus et la mémoire tiennent dans le contexte du modèle, avec des règles strictes : citer chaque fait, distinguer proposition / décision / livraison / validation, et répondre « non documenté » plutôt qu'inventer.
   - **Fournisseurs :** Claude (Anthropic) par défaut ; **Google Gemini** (palier gratuit) pour la démo publique.
   - **Robustesse :** cache des réponses, nouvelles tentatives, et bascule automatique entre modèles quand un quota est épuisé.
7. **Mise en ligne sans abonnement pour le jury :**
   - site publié sur **GitHub Pages** par GitHub Actions, après les tests ;
   - chat relayé par un **Cloudflare Worker** qui garde la clé API secrète et ne sert qu'à interroger NOVA ;
   - protections : origines autorisées, limites par visiteur et par jour, cache ;
   - **12 réponses pré-enregistrées et relues** (questions d'exemple et questions pièges) garantissent une démo fonctionnelle même hors quota.

---

## Champ « Challenges we ran into »

- **Des sources qui se contredisent, avec des dates de fichier trompeuses.** Le registre des risques daté du 29 septembre affiche encore le connecteur comme « Ouvert ». Sa ligne n'avait pas été mise à jour depuis le 9 septembre, et le ticket avait été fermé le 17. Nous tranchons donc par l'**autorité** de la source et la **date des faits**, jamais par la date du fichier, et chaque arbitrage est documenté.
- **Proposition, décision, livraison et validation.** « Correctif déployé » ne veut pas dire « sécurité acceptée » ; « nous recommandons le 22 » ne veut pas dire « le comité approuve le 22 ». Ces nuances sont le cœur des réponses ; elles sont modélisées explicitement dans la chronologie.
- **Les LLM inventent des repères.** Notre validateur a détecté, dans des réponses générées, des citations vers des lignes ou des pages inexistantes, ainsi que des formulations trop affirmatives (« refus » au lieu de « report »). D'où la vérification systématique des citations, le marquage en rouge dans le chat, et la relecture humaine de toute réponse publiée.
- **Intégrer un événement sans rien casser.** Nos répétitions ont mis au jour plusieurs défauts du brouillon généré :
  - un JSON invalide ;
  - des éléments recopiés comme « modifiés » ;
  - une erreur de calcul de date ;
  - des éléments reformulés sans raison.

  Les garde-fous déterministes, la réparation du JSON et la relecture obligatoire règlent ces problèmes. Le point clé, réussi lors d'une répétition : un runbook **reçu** mais **pas encore approuvé** laisse bien la condition de go-live ouverte.
- **Des événements dans tous les formats.** Les pièces jointes absentes du corpus doivent devenir des preuves à part entière, et les captures doivent être transcrites sans être prises pour des vérités : la transcription automatique reste marquée « à relire ».
- **Un chat public sur un hébergement statique, avec un quota gratuit.** Mettre la clé dans la page l'aurait exposée. Le relais Cloudflare, les limites, le cache, la bascule entre modèles et les réponses pré-enregistrées assurent à la fois la sécurité et la disponibilité.

---

## Champ « Accomplishments that we're proud of »

- **Dix réponses sourcées et nuancées**, chacune avec fichier, repère précis et extrait. Plusieurs croisent des sources distinctes : comité, ticket, courriel, capture.
- **278 citations vérifiées automatiquement** : aucune affirmation de la mémoire ne pointe vers une preuve inexistante.
- **Des contradictions expliquées plutôt que cachées**, y compris dans un plan et dans un registre de risques.
- **Une mise à jour qui conserve l'historique.** Le baseline reste consultable, et l'on voit précisément ce qui a changé, ce qui est affecté et ce qui ne change pas, sans approbation inventée ni condition fermée sans preuve.
- **Une honnêteté sur les limites :**
  - les informations manquantes sont listées (date du re-test SEC-210, date de la prochaine build, acceptation du jalon 3, absence d'instance go/no-go) ;
  - les recommandations de l'équipe ne sont jamais présentées comme des engagements.
- **Une démo utilisable par le jury en un clic**, chat compris, sans compte ni abonnement, et un export qui fonctionne hors ligne.

---

## Champ « What we learned »

- Dans un projet réel, **la fraîcheur d'un document ne garantit pas son exactitude** : il faut raisonner sur l'autorité de la source et la date des faits.
- **L'IA est très efficace pour lire, relier et rédiger, mais elle doit être contrôlée.** Une vérification automatique des citations, des garde-fous déterministes et une relecture humaine sont indispensables pour qu'une équipe puisse s'y fier.
- La valeur d'une mémoire de projet tient autant à **ce qu'elle refuse d'affirmer** (« non documenté », « à confirmer ») qu'à ce qu'elle affirme.
- Une bonne démo, c'est d'abord **un accès simple et fiable**, avec un plan de secours quand un service externe flanche.

---

## Champ « What's next for NOVA 360 »

- Ingestion de nouvelles sources en continu (boîte courriel, outil de tickets, comptes rendus), avec une détection automatique des contradictions.
- Proposition automatique de corrections documentaires : mise à jour du plan, du registre des risques et du rapport de statut.
- Comparaison de plusieurs projets, et réutilisation des leçons apprises d'un projet à l'autre.
- Relecture collaborative des brouillons de mise à jour, avec l'historique des validations et des auteurs.
- Alertes sur les échéances « à confirmer » et sur les conditions de go-live encore ouvertes à l'approche de la date cible.

---

## Champ « Built With » (une étiquette à la fois)

claude, claude-code, gemini, llm, typescript, javascript, html5, css3, vite, node.js, cloudflare-workers, wrangler, github-pages, github-actions, minisearch, unpdf, sheetjs, jsonrepair, vitest, happy-dom, fflate, git, github

---

## Champ « Try it out » (liens)

- https://louisbarbonet.github.io/NOVA360/
- https://github.com/LouisBarbonet/NOVA360
- Résultats consultables sans exécuter de code : https://github.com/LouisBarbonet/NOVA360/blob/main/RESULTATS.md

## Fichier à joindre (si Devpost le permet)

- `NOVA360_remise.zip` : application hors ligne (`dist/index.html`), livrables Markdown/PDF, mode d'emploi.
