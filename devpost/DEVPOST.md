# Texte de la page Devpost — NOVA 360

> À copier champ par champ dans Devpost. Les captures se trouvent dans `devpost/captures/` (ordre et légendes ci-dessous).
> ⚠ Après la nouvelle information du jour J : remplacer les captures 13 à 15 (actuellement une **répétition avec un événement simulé**) et mettre à jour la section « What it does → Après la nouvelle information ».

---

## Captures d'écran (galerie Devpost, dans cet ordre)

| Fichier | Légende |
|---|---|
| `01-brief.png` | Brief de reprise d'une page : responsable, date approuvée et conditions, portée, budget, factures, priorités. Chaque phrase renvoie à sa preuve. |
| `02-questions-q01-q10.png` | Les dix questions du défi : réponse courte, nuances, puis preuves cliquables (fichier + repère). |
| `03-preuve-surlignee.png` | Un clic sur une preuve ouvre le fichier source avec le passage surligné : ici, l'approbation du 22 octobre en comité (M04, lignes 17 à 23). |
| `04-capture-transcrite.png` | Les captures d'écran sont des preuves à part entière : le runbook et sa transcription (retour arrière « TODO », validation « À compléter »). |
| `05-cellule-excel.png` | Preuve au niveau de la cellule Excel : le plan v3 indique encore le 15 octobre (cellule E7), une information périmée. |
| `06-chronologie.png` | Chronologie filtrable qui distingue proposition, décision, livraison et validation (ici, le fil Sécurité). |
| `07-dossier-decisions.png` | Dossier de décisions : qui a proposé, qui a décidé, pourquoi, et la chaîne des faits avec l'extrait exact de chaque preuve. |
| `08-contradictions.png` | Contradictions résolues par l'autorité de la source ou la date des faits, jamais par la date du fichier. |
| `09-actions-risques.png` | Actions restantes : responsable, échéance (ou « à confirmer »), preuve, et distinction entre engagement documenté et recommandation de l'équipe. |
| `10-budget-factures.png` | Budget : autorisé, payé, en validation et facturé sans autorisation (CR-04 sur INV-003). |
| `11-sources.png` | Le corpus complet ; doublons, bruit et historique sont signalés et jamais comptés comme preuves indépendantes. |
| `12-recherche.png` | Recherche plein texte, tolérante aux accents. |
| `13-mise-a-jour-avant-apres.png` | Après un nouvel événement : ce qui change (avant / après), ce qui est affecté, ce qui ne change pas, avec les preuves. *(Répétition avec un événement simulé.)* |
| `14-brief-apres-evenement.png` | Le brief de la nouvelle version, avec l'encadré des changements depuis le baseline, qui reste intact. *(Répétition.)* |
| `15-q01-modifiee-u1.png` | Les réponses touchées par l'événement sont marquées « modifié · U1 ». *(Répétition.)* |
| `16-chat-question-piege.jpg` | Chat en langage naturel avec citations cliquables : à « Qui a approuvé CR-04? », il répond « Personne » et le prouve. |

---

## Inspiration

Reprendre un projet en cours, c'est souvent hériter d'une boîte de courriels, de comptes rendus, de tickets, de factures et de plans qui ne disent pas tous la même chose. Dans NOVA, le plan projet du 12 septembre annonce encore le 15 octobre alors que le comité a approuvé le 22 octobre deux jours plus tôt ; un rapport de statut affiche la sécurité « au vert » alors que le correctif n'est que livré, pas accepté ; une facture contient 18 000 $ pour une demande de changement restée à l'état de brouillon.

Le vrai risque n'est pas le manque d'information : c'est de se fier à la mauvaise. Notre objectif : une mémoire de projet sur laquelle une équipe peut **réellement s'appuyer**, où chaque affirmation pointe vers sa preuve, où l'on distingue toujours une proposition d'une décision, et une livraison d'une validation.

## What it does

**NOVA 360** transforme les 64 fichiers du dossier (courriels, transcriptions de réunions, tickets, captures d'écran, PDF, classeurs Excel) en une mémoire opérationnelle consultable, sourcée et mise à jour sans perdre l'historique.

- **Brief de reprise d'une page** (imprimable) : responsable, date approuvée et conditions, portée, budget, factures, priorités, et les trois conditions de go-live reliées à leurs actions, responsables et échéances.
- **Réponses aux dix questions du défi**, chacune avec fichier source, repère précis (ligne, page, cellule, capture) et extrait exact. Par exemple :
  - la mise en production est le **22 octobre 2026**, mais ce n'est **pas un go garanti** : elle reste conditionnelle à la validation sécurité de SEC-210, à la fermeture d'ACC-303 et à l'approbation du runbook avec retour arrière ;
  - le montant autorisé est de **204 000 $** (180 000 $ du contrat + 24 000 $ du CR-01 approuvé) ; les 18 000 $ de CR-04 facturés sur INV-003 ne sont pas autorisés.
- **Mémoire consultable** :
  - 35 événements datés, typés proposition / décision / livraison / validation ;
  - 7 décisions avec leur justification ;
  - **8 contradictions résolues** par l'autorité ou la date des faits ;
  - 13 actions (5 engagements documentés, 8 recommandations de l'équipe, toujours distinguées) ;
  - 4 risques principaux et 8 informations manquantes déclarées comme telles, sans échéance ni approbation inventée.
- **Preuves navigables** : chaque citation ouvre le fichier d'origine avec le passage surligné ; les pièces jointes dupliquées et le bruit (facture d'un autre projet, notes anonymes) sont signalés et ne comptent jamais comme confirmations indépendantes.
- **Dossier de décisions** : pour chaque décision, la chaîne complète des preuves avec leurs extraits.
- **Recherche plein texte** et **chat en langage naturel** qui cite ses sources (citations cliquables ; une citation dont le repère n'existe pas s'affiche en rouge).
- **Après la nouvelle information** : l'événement est intégré comme une nouvelle source ; l'application affiche ce qui change (avant / après), les éléments affectés, ce qui ne change pas et les actions touchées. **Le baseline n'est jamais modifié** : un sélecteur de version permet de comparer l'état initial et l'état actualisé.
- **Exports** : brief en PDF d'une page, réponses, mémoire et dossier de décisions en Markdown, pour chaque version.

## How we built it

Une approche **« preuve d'abord »** : chaque fait de la mémoire est une citation vérifiable, et c'est la machine qui vérifie que la preuve existe.

1. **Extraction du corpus** (TypeScript) :
   - courriels MIME décodés, avec les pièces jointes reliées au fichier séparé qu'elles dupliquent ;
   - PDF découpés par page (unpdf) ;
   - classeurs Excel lus cellule par cellule, commentaires compris (SheetJS) ;
   - les 8 captures d'écran transcrites puis relues, et signalées comme transcriptions manuelles.
2. **Mémoire structurée** (JSON) : brief, réponses, chronologie, décisions, contradictions, actions, risques, finances, informations manquantes. Rédigée avec l'aide de Claude Code, puis relue par l'équipe contre les sources.
3. **Validation automatique** : un script vérifie que **chacune des 278 citations** pointe vers une ligne, une page, une cellule (ou une plage) ou une capture qui existe vraiment. Les **36 tests automatisés** couvrent le rendu de toutes les pages, le surlignage des preuves, la cohérence des montants et la superposition des mises à jour.
4. **Application web** (Vite + TypeScript, sans framework) compilée en **un seul fichier HTML** qui fonctionne aussi hors ligne.
5. **Mises à jour superposées** : chaque événement produit une couche datée (U1, U2…) fusionnée par identifiant au-dessus du baseline, qui reste intact. Un LLM rédige un **brouillon** d'impact ; l'équipe le relit avant de l'enregistrer. Côté serveur, les éléments recopiés sans changement sont retirés automatiquement, pour que seuls les vrais changements soient signalés.
6. **Chat** : pas de base vectorielle. Le corpus et la mémoire tiennent dans le contexte du modèle, avec des règles strictes : citer chaque fait, distinguer proposition / décision / livraison / validation, et répondre « non documenté » plutôt qu'inventer.
   - **Fournisseurs :** Claude (Anthropic) par défaut ; **Google Gemini** (palier gratuit) pour la démo publique.
   - **Robustesse :** cache des réponses, nouvelles tentatives et modèle de repli si Gemini est surchargé.
7. **Mise en ligne sans abonnement pour le jury** :
   - le site est publié sur **GitHub Pages** par GitHub Actions, après les tests ;
   - le chat passe par un **Cloudflare Worker** qui garde la clé API secrète et construit lui-même la requête, pour qu'il ne puisse servir qu'à interroger NOVA ;
   - protections : origines autorisées, 6 questions par minute et par visiteur, plafond quotidien, cache des réponses ;
   - **12 réponses pré-enregistrées** et relues (questions d'exemple et questions pièges) garantissent une démo fonctionnelle même si le quota est épuisé.

## Challenges we ran into

- **Des sources qui se contredisent, avec des dates de fichier trompeuses.** Le registre des risques daté du 29 septembre affiche encore le connecteur comme « Ouvert », mais sa ligne n'a pas été mise à jour depuis le 9 septembre, et le ticket a été fermé le 17. Nous avons appris à trancher par l'**autorité** de la source et la **date des faits**, jamais par la date du fichier, et à documenter chaque arbitrage.
- **Proposition, décision, livraison et validation.** « Correctif déployé » n'est pas « sécurité acceptée » ; « nous recommandons le 22 » n'est pas « le comité approuve le 22 ». Ces nuances sont le cœur des réponses ; elles sont modélisées explicitement dans la chronologie.
- **Les LLM inventent des repères.** En relisant les réponses générées, notre validateur a détecté des citations vers des lignes ou des pages inexistantes, ainsi qu'une formulation trop affirmative (« refus » au lieu de « report »). D'où la vérification systématique des citations, le marquage en rouge dans le chat et la relecture humaine de toute réponse publiée.
- **Intégrer un événement sans rien casser.** Lors d'une répétition, le premier brouillon d'impact généré par le LLM :
  - contenait un JSON invalide ;
  - recopiait tous les éléments comme « modifiés » ;
  - affirmait qu'une date du 29 octobre « dépassait » la fin du contrat du 31 octobre.

  Nous avons ajouté le mode JSON natif, la réparation tolérante, le retrait des éléments inchangés, des consignes de vérification des dates et une étape de relecture obligatoire.
- **Un chat public sur un hébergement statique, avec un quota gratuit.** Mettre la clé dans la page l'aurait exposée. Le relais Cloudflare, les limites, le cache et les réponses pré-enregistrées règlent la sécurité et la disponibilité.
- **Un brief d'une page maximum**, même après une mise à jour qui ajoute un encadré de changements : la mise en page d'impression a dû être compactée et vérifiée sur les deux versions.

## Accomplishments that we're proud of

- **Dix réponses sourcées et nuancées**, chacune avec fichier, repère précis et extrait. Plusieurs croisent des sources distinctes : comité, ticket, courriel, capture.
- **278 citations vérifiées automatiquement** : aucune affirmation de la mémoire ne pointe vers une preuve inexistante.
- **Des contradictions expliquées plutôt que cachées**, y compris dans un plan et dans un registre de risques.
- **Une mise à jour qui conserve l'historique** : le baseline reste consultable, et l'on voit précisément ce qui a changé, ce qui est affecté et ce qui ne change pas, sans approbation inventée ni condition fermée sans preuve.
- **Une honnêteté sur les limites** : les informations manquantes sont listées (date du re-test SEC-210, date de la prochaine build, acceptation du jalon 3, absence d'instance go/no-go), et les recommandations de l'équipe ne sont jamais présentées comme des engagements.
- **Une démo utilisable par le jury en un clic**, chat compris, sans compte ni abonnement, et un export qui fonctionne hors ligne.

## What we learned

- Dans un projet réel, **la fraîcheur d'un document ne garantit pas son exactitude** : il faut raisonner sur l'autorité de la source et la date des faits.
- **L'IA est très efficace pour lire, relier et rédiger, mais elle doit être contrôlée** : une vérification automatique des citations et une relecture humaine sont indispensables pour qu'une équipe puisse s'y fier.
- La valeur d'une mémoire de projet tient autant à **ce qu'elle refuse d'affirmer** (« non documenté », « à confirmer ») qu'à ce qu'elle affirme.
- Une bonne démo pour un jury, c'est d'abord **un accès simple et fiable**, avec un plan de secours quand un service externe flanche.

## What's next for NOVA 360

- Ingestion de nouvelles sources en continu (boîte courriel, outil de tickets, comptes rendus) avec une détection automatique des contradictions.
- Proposition automatique de corrections documentaires : mettre à jour le plan, le registre des risques, le rapport de statut.
- Comparaison de plusieurs projets et réutilisation des leçons apprises d'un projet à l'autre.
- Relecture collaborative des brouillons de mise à jour, avec historique des validations et des auteurs.
- Alertes sur les échéances « à confirmer » et sur les conditions de go-live encore ouvertes à l'approche de la date cible.

## Built With

claude · claude-code · gemini · llm · typescript · javascript · html5 · css3 · vite · node.js · cloudflare-workers · wrangler · github-pages · github-actions · minisearch · unpdf · sheetjs · vitest · happy-dom · fflate · git · github

## Try it out

- **Application en ligne (aucune installation)** : https://louisbarbonet.github.io/NOVA360/
- **Code source, livrables et mode d'emploi** : https://github.com/LouisBarbonet/NOVA360
- **Export hors ligne** : `NOVA360_remise.zip` (ouvrir `dist/index.html`)
