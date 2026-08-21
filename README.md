# GEARSTORM: Boss Circuit v2.8.0

GEARSTORM est un boss rush 2D original. Riva Spark traverse les six machines transformables de la campagne de Cassian Voltério, puis affronte vingt-quatre profils supplémentaires dans la Forge : 30 boss jouables, 90 phases et 90 contrats de maîtrise.

## Jouer en local

Prérequis pour le serveur local et les outils de validation : Node.js 22.x.

```text
npm install
npm start
```

Ouvrir ensuite `http://127.0.0.1:8080`. Sous Windows, `LANCER_LE_JEU.bat` lance également la version locale dans le navigateur.

Le mode `file://` reste un repli jouable, mais l’installation PWA, le service worker et le cache hors ligne exigent HTTP ou HTTPS.

## Cibles de publication

- Dépôt GitHub prévu : https://github.com/darknigthmare/gearstorm-boss-circuit
- URL Vercel prévue : https://gearstorm-boss-circuit.vercel.app

Ces identifiants décrivent les cibles du projet. Ce document ne confirme ni l’état Git distant, ni un déploiement Vercel, ni la disponibilité publique du candidat v2.8.0.

## Contenu

- Campagne complète de six boss, chacun en trois phases, avec intro, prologue, interludes, Atelier et deux fins de parcours.
- Laboratoire d’entraînement, Forge libre des 30 boss et Circuit Forge séquentiel 07–30.
- Circuit Forge composé de quatre vagues de six rencontres ; ENDURANCE ENGINE possède en plus six manches internes.
- Onze modules d’amélioration cumulables selon leurs limites propres.
- Surcharge Overdrive, ruée invulnérable, double saut et tir évolutif.
- Trois difficultés, score, rangs, chronomètres et reprises séparées de campagne et de Forge.
- Clavier AZERTY/QWERTY, souris, manette standard et commandes tactiles.
- Sauvegarde locale v5 versionnée, migrée et normalisée.
- Audio et musique synthétiques via Web Audio, sans dépendance distante.
- Mouvement réduit, contraste renforcé et réglage des tremblements.
- PWA installable avec cache hors ligne et fallback Canvas.

## Correctifs de fiabilité v2.8.0

### ENDURANCE ENGINE

Ses six manches font désormais partie de la condition de victoire. Les passages de phase exigent les manches 2 puis 4, et la destruction finale exige la manche 6. Un build à fort DPS ne peut donc plus sauter l’épreuve d’endurance en traversant seulement les seuils de points de vie.

### Checkpoints déterministes

Les reprises de campagne et de Circuit Forge conservent le nombre de nouvelles tentatives du boss courant. La pénalité et le rang sont ainsi recalculés à partir du même état après rechargement.

Lorsqu’un checkpoint est sauvegardé à l’Atelier, les trois modules proposés sont également conservés. Reprendre une partie ne relance plus l’offre et ne permet plus de chercher un tirage plus favorable.

### Sauvegarde de secours

Le runtime sait exporter la sauvegarde courante sous forme d’un fichier JSON v5 déjà normalisé. L’import refuse les fichiers de plus de 1 Mio, parse le JSON, puis fait passer les données exclusivement par la migration et la normalisation existantes avant de persister et resynchroniser progression, Codex et reprises.

Les contrôles `#export-save` et `#import-save` sont rendus dans les options. `#import-save-file` reste un input fichier masqué, limité au JSON et doté d’un libellé accessible ; il n’est activé qu’après l’action explicite d’import.

### Préférences système au premier lancement

Une sauvegarde réellement neuve initialise `reduceMotion` depuis `prefers-reduced-motion: reduce` et `highContrast` depuis `prefers-contrast: more`. Cette détection ne remplace jamais les choix d’une sauvegarde existante ou migrée.

### Cartes de boss

Les cartes déverrouillées utilisent maintenant une miniature décorative provenant de la pièce WebP réelle du boss. Les cartes verrouillées n’exposent pas l’image ; le nom, l’état et le libellé accessible restent indépendants de la miniature.

### Mise à jour PWA consentie

Le runtime écoute `waiting` et `updatefound`. Le bouton `#update-app` est rendu masqué : pour une version déjà contrôlée, un worker en attente le révèle et seule l’action de la joueuse envoie `{ type: 'SKIP_WAITING' }`. Le premier install reste silencieux et `controllerchange` ne déclenche qu’un seul rechargement.

## Circuit Forge

Le Circuit Forge enchaîne les machines 07 à 30 en quatre vagues de six rencontres. La sauvegarde v5 conserve le boss courant, le checkpoint `fight`, `upgrade` ou `ending`, le temps cumulé, les pénalités, le score, la difficulté, les tentatives et le build installé. La reprise ne modifie jamais les six relais de campagne.

Les vingt-quatre profils Forge exposent vingt-quatre `mechanicId` et soixante-douze signatures d’état uniques, trois par boss. Ces signatures enrichissent huit familles moteur partagées — renvoi, leurre, modules, mimétisme, voies/verticalité, gravité/météo, posture/duo et puzzle/endgame — et ne sont pas présentées comme vingt-quatre moteurs indépendants.

Les 72 contrats Forge sont instrumentés par la télémétrie réelle du combat. Une métrique inconnue échoue fermement ; aucun contrat n’est acquis par défaut. Avec les 18 contrats de campagne, le jeu totalise 90 contrats.

## Narration

La campagne suit **Intro → Prologue → Boss → Résultat → Interlude → Atelier**. Voltério a centralisé six services civils dans la Couronne ; Riva réactive la ligne manuelle M-0 et rend chaque relais à son district sans devenir une nouvelle autorité centrale.

Le Codex sépare la connaissance de la progression : une victoire de Laboratoire peut documenter une machine, mais ne libère jamais son relais. La Forge libre et le Circuit Forge ont eux aussi leur progression propre et n’altèrent pas la campagne.

## Direction artistique

La version applicative est v2.8.0, mais le pack artistique reste volontairement immuable en **v2.7.0**. Vingt-six masters originaux produits avec OpenAI Image Generation alimentent **225 WebP runtime** :

| Famille | Masters | Assets runtime |
| --- | ---: | ---: |
| Six décors de campagne, quatre couches de parallaxe chacun | 6 | 24 |
| Six boss de campagne, neuf pièces articulables chacun | 6 | 54 |
| Vingt-quatre boss Forge, quatre pièces transparentes chacun | 4 planches | 96 |
| Vingt-quatre arènes Forge, un backdrop dédié chacune | 6 planches | 24 |
| Riva Spark : atlas historique, corps cohérent v4 et bras-canon v4 | 3 | 11 |
| Effets visuels de combat | 1 | 16 |
| **Total** | **26** | **225** |

Le rig de Riva compose une seule fois le corps, raccorde un bras-canon indépendant au socket d’épaule et aligne le pivot des semelles sur le plancher logique. Chaque machine Forge possède quatre pièces et un backdrop ; les transformations secondaires restent pilotées par les huit familles communes et les arènes Forge ne sont pas revendiquées comme des décors parallaxe multicouches.

Le rendu Canvas reste disponible si une image manque ou ne se décode pas. Le service worker garde le shell et le manifeste artistique, puis met les WebP utiles en cache à la demande au lieu de précacher les 225 fichiers.

## Commandes

| Action | Clavier / souris | Manette |
| --- | --- | --- |
| Déplacement | `Q/D`, `A/D`, flèches | Stick gauche |
| Saut | `Espace`, `W`, flèche haut | A |
| Tir | `J`, `Z`, `C`, clic gauche | X |
| Ruée | `K`, `Maj` | B |
| Surcharge | `L`, `X` | Y |
| Pause | `Échap`, `P` | Menu |

Sur mobile portrait, le jeu affiche un conseil d’orientation : le paysage reste recommandé pour conserver la largeur tactique de l’arène.

## Accessibilité et preuves automatisées présentes

Le CSS contient les variantes `prefers-reduced-motion` et `prefers-contrast`, des cibles tactiles et une recommandation paysage en portrait. Le runtime garde aussi des réglages manuels prioritaires.

Le dépôt contient un workflow CI Node 22.x. Playwright exécute par défaut Chromium desktop et un profil mobile tactile ; Firefox et WebKit sont configurés en opt-in, sans exécution revendiquée dans cette revue.

Le fichier `tests/e2e/forge.spec.mjs` couvre :

- l’ouverture du menu et de la Forge, la grille de 30 cartes et l’absence de débordement horizontal ;
- les diagnostics de contact au sol et de composition des bras de Riva ;
- les 24 boss Forge lancés dans leurs trois phases, soit 72 états de démarrage ;
- le démarrage du Circuit Forge et la création de son premier checkpoint.

Le fichier `tests/e2e/accessibility.spec.mjs` couvre en Chromium :

- l’ouverture des options au clavier, l’ordre du focus et les cibles de 44 CSS px ;
- le téléchargement de l’export JSON v5 et l’import d’un JSON normalisé ;
- l’initialisation mouvement réduit/contraste renforcé sur une sauvegarde neuve ;
- la navigation de menu par Gamepad API simulée ;
- le rechargement hors ligne d’un shell déjà installé.

Ces fichiers décrivent une couverture automatisée, pas une QA finale. Ils ne remplacent pas les tests matériels de manette, tactile, lecteur d’écran ou mobile bas de gamme. Le consentement face à un worker réellement `waiting` reste couvert par les contrats Node, pas par un E2E navigateur ; les six manches complètes d’ENDURANCE ENGINE ne sont pas encore parcourues en E2E. Firefox et WebKit restent configurés mais non exécutés dans cette revue.

## Qualité et build

La porte de qualité prévue est :

```text
npm run qa
```

La matrice Chromium prévue est :

```text
npm run test:e2e
```

La matrice Firefox/WebKit reste opt-in :

```text
npm run test:e2e:cross-browser
```

Les contrôles ciblés restent `npm test`, `npm run build` et `npm run check:release`. `QA_REPORT.md` est réservé aux validations réellement exécutées ; ce README ne certifie ni QA finale ni déploiement.

## Structure

- `index.html`, `styles.css`, `game.js` : jeu et interface.
- `story.js` : campagne narrative des six districts.
- `expansion-story.js` : quatre vagues Forge, journaux, objectifs et 72 contrats instrumentés.
- `boss-roster.js` : registre des 30 machines, 24 `mechanicId`, 72 états Forge et huit familles partagées.
- `assets/generated/v2.7.0/` : pack runtime immuable de 225 WebP.
- `manifest.webmanifest`, `sw.js` : installation et fonctionnement hors ligne.
- `server.js` : serveur local à surface publique restreinte.
- `scripts/` : build, contrats et garde-fous de release.
- `tests/` : contrats Node et parcours Playwright.
- `DESIGN.md`, `GAME_DESIGN.md` et `GAME_AUDIT.md` : règles, intégration et audit courant.

Projet original. Tous droits réservés.
