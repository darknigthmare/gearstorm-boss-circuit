# GEARSTORM: Boss Circuit v2.3

GEARSTORM est un boss rush 2D original. Riva Spark traverse les six machines transformables du Professeur Cassian Voltério, améliore son équipement entre les combats et libère les districts emprisonnés dans le Circuit.

## Jouer en local

Prérequis pour le serveur local et les outils de validation : Node.js 22 ou plus récent.

```text
npm install
npm start
```

Ouvrir ensuite `http://127.0.0.1:8080`. Sous Windows, `LANCER_LE_JEU.bat` lance également la version locale dans le navigateur.

Le mode `file://` reste prévu comme solution de repli, mais l’installation PWA, le service worker et le cache hors ligne exigent HTTP ou HTTPS.

## Cibles de publication

- Dépôt GitHub prévu : https://github.com/darknigthmare/gearstorm-boss-circuit
- URL Vercel prévue : https://gearstorm-boss-circuit.vercel.app

Ces identifiants décrivent les cibles du projet. Ils ne certifient pas que la révision v2.2 est actuellement poussée ou déployée. L’état public doit être confirmé par les contrôles Git, le statut Vercel et une requête HTTP au moment de la release.

## Contenu

- Six boss originaux, chacun structuré en trois phases lisibles.
- Campagne complète, Laboratoire d’entraînement, trois difficultés et épilogue.
- Choix d’améliorations entre les combats du Circuit.
- Surcharge Overdrive, ruée invulnérable, double saut et tir évolutif.
- Clavier AZERTY/QWERTY, souris, manette standard et commandes tactiles.
- Sauvegarde locale versionnée, migrée et normalisée.
- Audio et musique synthétiques via Web Audio, sans dépendance distante.
- Mouvement réduit, contraste renforcé et réglage des tremblements.
- Cible PWA installable avec cache hors ligne et présentation sociale dédiée.

## Expérience narrative et qualité de vie v2.3

La v2.3 relie chaque combat à la libération d’un district et donne une place visible à la progression :

- récapitulatif de campagne et prochaine cible dès l’écran titre ;
- reprise de Circuit prévue par `#continue-run`, affichée seulement lorsqu’une progression compatible existe ;
- briefing d’objectif lisible au-dessus du combat, avec conseil contextuel désactivable ;
- Codex consultable pour Riva Spark, Cassian Voltério, les six machines et leurs districts ;
- objectif, build et rappel des commandes dans la pause ;
- journal narratif, build actif et conséquence locale sur l’écran de résultat ;
- itinéraire des six districts au prologue et bilan de libération à l’épilogue ;
- états compacts pour mobile, contraste renforcé et annonces non intrusives pour les technologies d’assistance.

### Contrat des hooks DOM

Le runtime conserve tous les IDs historiques et pilote les nouveaux hooks suivants :

| Hook | Responsabilité runtime |
| --- | --- |
| `#continue-run` | Rester masqué sans reprise valide ; afficher la destination dans `#continue-run-detail` et reprendre sans écraser la sauvegarde. |
| `#campaign-progress`, `#campaign-next` | Résumer les districts libérés et la prochaine machine depuis la sauvegarde normalisée. |
| `#codex`, `#codex-screen` | Ouvrir le Codex, restaurer le focus au retour et respecter la navigation clavier/manette. |
| `#codex-grid`, `#codex-progress` | Déverrouiller les dossiers selon la progression, mettre à jour les états et exposer un texte compréhensible sans couleur seule. |
| `#combat-objective` | Annoncer l’objectif du boss ou de la phase sans être désactivé avec les conseils. |
| `#combat-hint`, `#hints-toggle` | Afficher un conseil bref lors d’une nouvelle mécanique, le masquer ensuite et persister la préférence. |
| `#pause-objective`, `#pause-build` | Reprendre l’objectif actuel et la description réelle des modules installés. |
| `#result-lore`, `#result-build` | Résumer la conséquence narrative de la victoire et le build avant la décision suivante. |

Les objectifs critiques restent disponibles même si les conseils sont coupés. Les changements d’état utilisent les régions `aria-live` existantes avec parcimonie afin de ne pas annoncer chaque frame.

## Direction artistique v2.2

La production v2.2 repose sur 14 masters originaux réalisés avec OpenAI Image Generation intégré, puis découpés et normalisés en 103 assets indépendants destinés au runtime.

| Famille | Masters | Découpage par master | Assets indépendants |
| --- | ---: | ---: | ---: |
| Décors d’arène | 6 | 4 couches de parallaxe | 24 |
| Boss | 6 | 9 pièces transparentes | 54 |
| Riva Spark | 1 | 9 poses / états | 9 |
| Effets visuels | 1 | grille 4 × 4 | 16 |
| **Total** | **14** |  | **103** |

Les masters sont des sources de production ; le jeu consomme les éléments exportés séparément. Les pièces de personnage, de boss et de VFX utilisent une transparence réelle, sans texte, logo ni filigrane. Les images sont des créations originales propres à GEARSTORM et ne reprennent aucun asset de franchise tierce.

Le rendu procédural Canvas reste le fallback de référence si une image manque, expire, ne se décode pas ou ne peut pas être chargée. Le chargement est conçu pour être progressif : le key art et les éléments de titre sont prioritaires, puis les couches d’arène et les pièces du combat courant sont demandées à la volée. Le loader accessible du titre/prologue peut annoncer cette progression sans bloquer le menu. Sous HTTP ou HTTPS, le service worker peut ensuite mettre en cache les réponses valides selon sa stratégie PWA.

## Commandes

| Action | Clavier / souris | Manette |
| --- | --- | --- |
| Déplacement | `Q/D`, `A/D`, flèches | Stick gauche |
| Saut | `Espace`, `W`, flèche haut | A |
| Tir | `J`, `Z`, `C`, clic gauche | X |
| Ruée | `K`, `Maj` | B |
| Surcharge | `L`, `X` | Y |
| Pause | `Échap`, `P` | Menu |

## Qualité et build

La porte de qualité prévue est :

```text
npm run qa
```

Les contrôles ciblés restent :

```text
npm test
npm run build
npm run check:release
```

Ces commandes décrivent le processus attendu ; ce document ne prétend pas qu’elles ont été exécutées sur la révision v2.2. `QA_REPORT.md` ne doit consigner que les validations réellement effectuées et n’est pas mis à jour par ce passage documentaire.

## Publication

- GitHub Actions est configuré pour exécuter l’installation, la QA et l’audit des dépendances.
- `vercel.json` décrit le build et la sortie publique attendus.
- Les archives ZIP sont des artefacts de release et ne sont pas destinées au suivi Git.
- Les secrets Vercel ou GitHub restent dans les coffres des plateformes.
- Une publication n’est déclarée terminée qu’après commit, push, déploiement prêt et vérification HTTP de l’URL publique.

## Structure

- `index.html`, `styles.css`, `game.js` : jeu et interface.
- `assets/` : key art, icônes et assets artistiques originaux.
- `manifest.webmanifest`, `sw.js` : installation et fonctionnement hors ligne.
- `server.js` : serveur local à surface publique restreinte.
- `scripts/build.mjs` : bundle web reproductible et empreintes SHA-256.
- `scripts/check-release.mjs` : garde-fous de publication.
- `tests/` : contrats du jeu et tests HTTP.
- `DESIGN.md` et `GAME_DESIGN.md` : univers, règles et contrat de production.

Projet original. Tous droits réservés.
