# GEARSTORM: Boss Circuit v2.7

GEARSTORM est un boss rush 2D original. Riva Spark traverse les six machines transformables de la campagne de Cassian Voltério, puis peut affronter vingt-quatre profils supplémentaires dans la Forge, soit trente boss jouables et quatre-vingt-dix phases.

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

Ces identifiants décrivent les cibles du projet. L’état public de la révision v2.7 doit être confirmé par les contrôles Git, le statut Vercel et une requête HTTP au moment de la release.

## Contenu

- Trente boss originaux jouables, chacun structuré en trois phases lisibles : six actes de campagne et vingt-quatre simulations Forge.
- Campagne complète, Laboratoire d’entraînement, Forge libre des 30 boss et Circuit Forge séquentiel 07–30, trois difficultés et deux fins de parcours.
- Onze modules d’amélioration, proposés entre les combats du Circuit et cumulables selon leurs limites propres.
- Surcharge Overdrive, ruée invulnérable, double saut et tir évolutif.
- Clavier AZERTY/QWERTY, souris, manette standard et commandes tactiles.
- Sauvegarde locale v5 versionnée, migrée et normalisée, avec reprise séparée des Circuits campagne et Forge.
- Audio et musique synthétiques via Web Audio, sans dépendance distante.
- Mouvement réduit, contraste renforcé et réglage des tremblements.
- Cible PWA installable avec cache hors ligne et présentation sociale dédiée.

## Circuit Forge v2.7

Le Circuit Forge enchaîne les machines 07 à 30 en quatre vagues de six rencontres. Une sauvegarde v5 conserve le prochain boss, le checkpoint `fight`, `upgrade` ou `ending`, le temps cumulé, les pénalités, le score et le build installé. La reprise rend donc le joueur au bon combat, au choix de module ou à la restauration finale sans modifier les six relais de campagne.

Les vingt-quatre profils Forge exposent vingt-quatre `mechanicId` distincts et soixante-douze signatures d’état uniques, trois par boss. Ces signatures enrichissent honnêtement huit familles moteur communes — renvoi, leurre, modules, mimétisme, voies/verticalité, gravité/météo, posture/duo et puzzle/endgame — plutôt que vingt-quatre moteurs de combat sans code partagé.

Les soixante-douze contrats Forge sont instrumentés et évaluables. Chaque réussite repose sur la télémétrie réelle du combat et n’est enregistrée qu’après validation ; une métrique inconnue n’accorde jamais un contrat par défaut. Le mode Forge libre reste disponible pour sélectionner une machine et lancer une tentative indépendante sans avancer le Circuit Forge.

## Expérience narrative et qualité de vie

La v2.4 raconte la reprise des six relais de sécurité qui coordonnent les services civils du Circuit. Cassian Voltério en a centralisé les commandes dans la Couronne ; Riva Spark remonte la ligne manuelle M-0 pour rendre chaque infrastructure à son district.

Le parcours narratif de campagne suit la séquence **Intro → Prologue → Boss → Résultat → Interlude → Atelier**. Après Crown Engine Ω, l’interlude final mène à l’épilogue : Cassian est placé en détention et Riva refuse de remplacer une commande exclusive par une autre.

La progression visible comprend :

- récapitulatif de campagne et prochaine cible dès l’écran titre ;
- reprise de Circuit prévue par `#continue-run`, affichée seulement lorsqu’une progression compatible existe ;
- intro de la prise de contrôle, prologue de la ligne M-0 et six interludes propres aux districts ;
- transmissions de Riva, Cassian et des canaux civils lors des changements de phase et entre les machines ;
- briefing d’objectif lisible au-dessus du combat, avec conseil contextuel désactivable ;
- Codex consultable pour Riva Spark, Cassian Voltério, l’origine des six machines, leur détournement et leur impact civil ;
- objectif, build et rappel des commandes dans la pause ;
- journal narratif, build actif et conséquence locale sur l’écran de résultat ;
- itinéraire des six relais au prologue et bilan des commandes locales à l’épilogue ;
- états compacts pour mobile, contraste renforcé et annonces non intrusives pour les technologies d’assistance.

### Contrat des hooks DOM

Le runtime conserve tous les IDs historiques et pilote les nouveaux hooks suivants :

| Hook | Responsabilité runtime |
| --- | --- |
| `#story-screen`, `#story-dialogue` | Présenter l’intro ou un interlude sans recouvrir le combat et rendre la progression explicite. |
| `#story-continue`, `#story-back` | Avancer dans la campagne ou revenir au menu par une action explicite. |
| `#continue-run` | Rester masqué sans reprise valide ; afficher la destination dans `#continue-run-detail` et reprendre sans écraser la sauvegarde. |
| `#campaign-progress`, `#campaign-next` | Résumer les districts libérés et la prochaine machine depuis la sauvegarde normalisée. |
| `#codex`, `#codex-screen` | Ouvrir le Codex, restaurer le focus au retour et respecter la navigation clavier/manette. |
| `#codex-grid`, `#codex-progress` | Déverrouiller les dossiers selon la progression, mettre à jour les états et exposer un texte compréhensible sans couleur seule. |
| `#story-archive`, `#story-archive-progress` | Recenser les transmissions narratives déjà découvertes sans confondre entraînement et campagne. |
| `#combat-objective` | Annoncer l’objectif du boss ou de la phase sans être désactivé avec les conseils. |
| `#radio-comms`, `#radio-speaker`, `#radio-line` | Afficher les communications de phase dans une région dédiée et temporaire. |
| `#combat-hint`, `#hints-toggle` | Afficher un conseil bref lors d’une nouvelle mécanique, le masquer ensuite et persister la préférence. |
| `#pause-objective`, `#pause-build` | Reprendre l’objectif actuel et la description réelle des modules installés. |
| `#result-lore`, `#result-build` | Résumer la conséquence narrative de la victoire et le build avant la décision suivante. |

Les objectifs critiques restent disponibles même si les conseils sont coupés. Les changements d’état utilisent les régions `aria-live` existantes avec parcimonie afin de ne pas annoncer chaque frame.

## Direction artistique v2.7

La production v2.7 repose sur vingt-six masters originaux réalisés avec OpenAI Image Generation intégré. Le bundle public contient 225 WebP normalisés, versionnés et contrôlés par SHA-256 ; les masters restent réservés à la provenance et ne sont pas chargés par le jeu.

| Famille | Masters | Assets runtime |
| --- | ---: | ---: |
| Six décors de campagne, quatre couches de parallaxe chacun | 6 | 24 |
| Six boss de campagne, neuf pièces articulables chacun | 6 | 54 |
| Vingt-quatre boss Forge, quatre pièces transparentes chacun | 4 planches | 96 |
| Vingt-quatre arènes Forge, un backdrop dédié chacune | 6 planches | 24 |
| Riva Spark : atlas historique, corps cohérent v4 et bras-canon v4 | 3 | 11 |
| Effets visuels de combat | 1 | 16 |
| **Total** | **26** | **225** |

Le corps de production de Riva réunit poitrine, taille, bassin, jambes et bottes dans une silhouette cohérente. Son pivot de semelles est recalé sur le plancher logique : les pieds ne flottent plus et le torse n’est plus doublé par d’anciens fragments. Le bras de tir est une pièce indépendante raccordée au socket d’épaule, avec une petite ombre de contact au sol.

Les vingt-quatre profils Forge reçoivent chacun quatre pièces OpenAI originales — châssis, noyau et deux appendices — ainsi qu’un backdrop propre. Chaque profil possède trois phases, ses valeurs, ses télégraphes, son objectif, son journal et ses résultats. Les transformations secondaires restent pilotées par le moteur commun et le backdrop Forge reste une couche unique : ces packs ne sont donc pas présentés comme vingt-quatre rigs ou décors parallaxe entièrement sur mesure.

Le rendu Canvas conserve un fallback si un asset manque, ne se décode pas ou ne peut pas être mis en cache. Le service worker ne précache pas les 225 WebP : il garde le shell et le manifeste v2.7, puis stocke à la demande les ressources utiles. Les images sont des créations originales propres à GEARSTORM, sans texte, logo, filigrane ni asset d’une franchise tierce.

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

Ces commandes décrivent le processus attendu ; `QA_REPORT.md` ne consigne que les validations réellement exécutées sur le candidat courant.

## Publication

- GitHub Actions est configuré pour exécuter l’installation, la QA et l’audit des dépendances.
- `vercel.json` décrit le build et la sortie publique attendus.
- Les archives ZIP sont des artefacts de release et ne sont pas destinées au suivi Git.
- Les secrets Vercel ou GitHub restent dans les coffres des plateformes.
- Une publication n’est déclarée terminée qu’après commit, push, déploiement prêt et vérification HTTP de l’URL publique.

## Structure

- `index.html`, `styles.css`, `game.js` : jeu et interface.
- `story.js` : campagne narrative immuable des six districts.
- `expansion-story.js` : quatre vagues Forge, journaux, objectifs et 72 contrats instrumentés.
- `boss-roster.js` : registre jouable des 30 machines, 24 `mechanicId`, 72 états Forge et huit familles de mécaniques enrichies.
- `assets/` : key art, icônes et assets artistiques originaux.
- `manifest.webmanifest`, `sw.js` : installation et fonctionnement hors ligne.
- `server.js` : serveur local à surface publique restreinte.
- `scripts/build.mjs` : bundle web reproductible et empreintes SHA-256.
- `scripts/check-release.mjs` : garde-fous de publication.
- `tests/` : contrats du jeu et tests HTTP.
- `DESIGN.md` et `GAME_DESIGN.md` : univers, règles et contrat de production.
- `BOSS_EXPANSION.md` : contrat IP-safe livré des 24 machines Forge et backlog de raffinement du roster de 30 boss.

Projet original. Tous droits réservés.
