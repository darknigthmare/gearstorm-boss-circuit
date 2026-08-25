# GEARSTORM: Boss Circuit v2.11.0

GEARSTORM est un boss rush 2D original. Riva Spark traverse les six machines transformables de la campagne de Cassian Voltério, puis affronte vingt-quatre profils supplémentaires dans la Forge : 30 boss jouables, 90 phases et 90 contrats de maîtrise.

État courant du code : v2.11.0. Elle conserve les 30 boss, 90 phases et 90 contrats, sépare les records compétitifs et déploie les nouveaux rigs et décors multicouches.


## Jouer en local

Prérequis pour le serveur local et les outils de validation : Node.js 22.x.

```text
npm install
npm start
```

Ouvrir ensuite `http://127.0.0.1:8080`. Sous Windows, `LANCER_LE_JEU.bat` lance également la version locale dans le navigateur.


La production v2.11.0 est vérifiée sur GitHub Actions et Vercel ; les identifiants observés sont consignés ci-dessous et dans `QA_REPORT.md`.

Le mode `file://` reste un repli jouable, mais l’installation PWA, le service worker et le cache hors ligne exigent HTTP ou HTTPS.

## Passe v2.11.0 — rigs indépendants, parallaxe Forge et records segmentés

Riva utilise désormais quatorze pièces anatomiques : l’avant-bras proche et le canon sont deux couches indépendantes, assemblées sans modifier la silhouette neutre. Le recul suit l’axe réel du projectile et le contact des bottes reste calé sur la route.

Les vingt-quatre machines Forge passent à sept pièces animées par boss. Leurs arènes utilisent quatre plans `far`, `mid`, `ground` et `foreground`, avec le premier plan rendu après les acteurs pour une profondeur lisible sans masquer les télégraphes.

La sauvegarde v6 sépare les records par version d’équilibrage, mode, difficulté et variante. Temps, rang et score conservent chacun la tentative complète ; les valeurs v5 restent consultables comme héritage non classé au lieu d’être attribuées à une catégorie supposée.

Le mixage synthétique suit désormais la famille et l’intensité du boss, traverse un limiteur anti-saturation et expose trois réglages persistants : volume général, musique adaptative et effets/alertes.

## Publication vérifiée

La v2.11.0 a franchi `npm run qa:ci` avec 92 tests Node, 26 parcours Chromium réussis et 2 ignorés. Le gate complémentaire compte 25 réussites Firefox/WebKit et 3 scénarios ignorés, sans échec. Le commit applicatif `505f973` est validé par le run GitHub Actions `32897624756` et publié par Vercel sous `dpl_7eV3wtN3nMz23xKnnKk5Cuqxmstt`, état `READY`. L’alias [https://gearstorm-boss-circuit.vercel.app](https://gearstorm-boss-circuit.vercel.app) répond en HTTP 200 ; les smokes desktop et mobile chargent le manifeste v2.11 et le module de records sans erreur console ni requête échouée.

## Passe v2.10.0 — canon, robustesse et lecture causale

La Couronne est abolie, Cassian reste détenu et M-0 devient une infrastructure publique distribuée entre six équipes. Le Circuit Forge 07–30 se déroule après la campagne ; le Catalogue des 30 machines demeure une simulation hors chronologie.

Les archives comptent neuf transmissions relisibles, quatre révélations d’anneau, vingt-quatre journaux et soixante-douze voix de phase Forge. Cinq maîtrises contextuelles mesurent désormais leur cause exacte.

Riva conserve treize pièces anatomiques : l’asset proche `forearm-cannon-near` combine l’avant-bras et le canon. Le diagnostic relève une erreur de visée maximale d’environ `1,32 × 10⁻16`, un museau `[149, 297]`, un recul de `12 px` local (`13,2 px` Canvas), `roadLift = 10`, `headDrop = 4` et une poussière à `y = 610`.

Les sauvegardes contradictoires et checkpoints finaux sont normalisés, une sauvegarde v4 valide peut secourir une v5 corrompue, les erreurs de quota restent non destructives, le cache raster est borné à trois bundles de boss et les refus `cache.put` ne masquent plus les réponses réseau. Les preuves locales et les 24 captures avant/après sont regroupées dans [`docs/audits/v2.10.0/`](docs/audits/v2.10.0/README.md).

- Dépôt GitHub : https://github.com/darknigthmare/gearstorm-boss-circuit
- Jeu public Vercel : https://gearstorm-boss-circuit.vercel.app

La v2.10.0 est publiée depuis `main`. Le commit applicatif `b65b027` et le correctif de stabilité CI `bc0129a` sont poussés. Le run GitHub Actions `32871248113` est vert avec 26 parcours Chromium réussis, 2 ignorés et 0 échec ; l’audit npm ne trouve aucune vulnérabilité. Le déploiement Vercel `dpl_AgHpmCoLwomtZ6Xj51LcThcZdha9` est `READY`, rattaché à `bc0129a`, et l’alias public répond en HTTP 200.

Historique : la v2.9.1 avait été vérifiée sur le commit `8bd2b29`, le run `32789460141` et le déploiement `dpl_7mKBMcfvbHcXF4mevKm4RYUNEdG5`.

## Passe v2.9.1 — rig, route et récit méta utile

Riva est désormais assemblée par un rig hiérarchique de treize pièces anatomiques indépendantes, complété par deux effets. `pelvis` est l'unique racine : les jambes suivent le bassin, les bras et la tête suivent le torse, et le projectile part du museau transformé de `forearm-cannon-near`.

Riva et son ombre sont remontées visuellement de `10 px` afin que ses bottes reposent dans la chaussée peinte. Le sol physique reste à `y = 620`. Les six décors de campagne conservent leur décalage visuel de `+80 px` et les vingt-quatre backdrops Forge de `+28 px`, sans déplacer collisions, hitboxes ni télégraphes.

Les vingt-quatre profils Forge conservent leur interlude et leur `metaLine` dans le Codex, organisés en quatre anneaux. L'intro, le prologue et les communications de phase assument le regard méta de Riva et Cassian tout en donnant une information exploitable ; aucune voix générique « Système » ne parle à la joueuse. Les tutoriels, aides et libellés d'accessibilité restent factuels.

L'audit avant/après, les cycles course/saut et les actions tir/ruée sont archivés dans [`docs/audits/v2.9.1/`](docs/audits/v2.9.1/README.md).

## Contenu

- Campagne complète de six boss, chacun en trois phases, avec intro, prologue, interludes, Atelier et deux fins de parcours.
- Laboratoire d’entraînement, Forge libre des 30 boss et Circuit Forge séquentiel 07–30.
- Circuit Forge composé de quatre vagues de six rencontres ; ENDURANCE ENGINE possède en plus six manches internes.
- Onze modules d’amélioration cumulables selon leurs limites propres.
- Surcharge Overdrive, ruée invulnérable, double saut et tir évolutif.
- Trois difficultés, score, rangs, chronomètres et reprises séparées de campagne et de Forge.
- Clavier AZERTY/QWERTY, souris, manette standard et commandes tactiles.
- Sauvegarde locale v6 versionnée, migrée et normalisée, avec records segmentés.
- Audio et musique synthétiques via Web Audio, sans dépendance distante.
- Mouvement réduit, contraste renforcé et réglage des tremblements.
- PWA installable avec cache hors ligne et fallback Canvas.

## Correctifs de fiabilité conservés depuis v2.8.0

### ENDURANCE ENGINE

Ses six manches font désormais partie de la condition de victoire. Les passages de phase exigent les manches 2 puis 4, et la destruction finale exige la manche 6. Un build à fort DPS ne peut donc plus sauter l’épreuve d’endurance en traversant seulement les seuils de points de vie.

### Checkpoints déterministes

Les reprises de campagne et de Circuit Forge conservent le nombre de nouvelles tentatives du boss courant. La pénalité et le rang sont ainsi recalculés à partir du même état après rechargement.

Lorsqu’un checkpoint est sauvegardé à l’Atelier, les trois modules proposés sont également conservés. Reprendre une partie ne relance plus l’offre et ne permet plus de chercher un tirage plus favorable.

### Sauvegarde de secours

Le runtime sait exporter la sauvegarde courante sous forme d’un fichier JSON v6 déjà normalisé. L’import refuse les fichiers de plus de 1 Mio, parse le JSON, puis fait passer les données exclusivement par la migration et la normalisation existantes avant de persister et resynchroniser progression, Codex et reprises.

Les contrôles `#export-save` et `#import-save` sont rendus dans les options. `#import-save-file` reste un input fichier masqué, limité au JSON et doté d’un libellé accessible ; il n’est activé qu’après l’action explicite d’import.

### Préférences système au premier lancement

Une sauvegarde réellement neuve initialise `reduceMotion` depuis `prefers-reduced-motion: reduce` et `highContrast` depuis `prefers-contrast: more`. Cette détection ne remplace jamais les choix d’une sauvegarde existante ou migrée.

### Cartes de boss

Les cartes déverrouillées utilisent maintenant une miniature décorative provenant de la pièce WebP réelle du boss. Les cartes verrouillées n’exposent pas l’image ; le nom, l’état et le libellé accessible restent indépendants de la miniature.

### Mise à jour PWA consentie

Le runtime écoute `waiting` et `updatefound`. Le bouton `#update-app` est rendu masqué : pour une version déjà contrôlée, un worker en attente le révèle et seule l’action de la joueuse envoie `{ type: 'SKIP_WAITING' }`. Le premier install reste silencieux et `controllerchange` ne déclenche qu’un seul rechargement.

## Circuit Forge

Le Circuit Forge enchaîne les machines 07 à 30 en quatre vagues de six rencontres. La sauvegarde v6 conserve le boss courant, le checkpoint `fight`, `upgrade` ou `ending`, le temps cumulé, les pénalités, le score, la difficulté, les tentatives, le build installé et les records segmentés. La reprise ne modifie jamais les six relais de campagne.

Les vingt-quatre profils Forge exposent vingt-quatre `mechanicId` et soixante-douze signatures d’état uniques, trois par boss. Ces signatures enrichissent huit familles moteur partagées — renvoi, leurre, modules, mimétisme, voies/verticalité, gravité/météo, posture/duo et puzzle/endgame — et ne sont pas présentées comme vingt-quatre moteurs indépendants.

Les 72 contrats Forge sont instrumentés par la télémétrie réelle du combat. Une métrique inconnue échoue fermement ; aucun contrat n’est acquis par défaut. Avec les 18 contrats de campagne, le jeu totalise 90 contrats.

## Narration

La campagne suit **Intro → Prologue → Boss → Résultat → Interlude → Atelier**. Voltério a centralisé six services civils dans la Couronne ; Riva réactive la ligne manuelle M-0 et rend chaque relais à son district sans devenir une nouvelle autorité centrale.

Le Codex sépare la connaissance de la progression : une victoire de Laboratoire peut documenter une machine, mais ne libère jamais son relais. La Forge libre et le Circuit Forge ont eux aussi leur progression propre et n’altèrent pas la campagne. La v2.9 y archive les 24 interludes et `metaLine` Forge, ainsi qu’un panorama des quatre anneaux, afin que ce commentaire de conception reste consultable après chaque victoire.

## Direction artistique

Le pack artistique v2.11.0 est dérivé de **43 masters originaux OpenAI** vers **378 WebP runtime**, soit **39 212 378 octets** déclarés par le manifeste :

| Famille | Masters | Assets runtime |
| --- | ---: | ---: |
| Six décors de campagne, quatre couches de parallaxe chacun | 6 | 24 |
| Six boss de campagne, neuf pièces articulables chacun | 6 | 54 |
| Vingt-quatre boss Forge, sept pièces hiérarchisées chacun | 4 planches | 168 |
| Vingt-quatre arènes Forge, quatre couches de parallaxe chacune | 6 planches | 96 |
| Riva Spark : références et pièces séparées | 16 | 16 |
| Effets visuels de combat | 1 | 16 |
| Intro, prologue, fin campagne et fin Forge | 4 | 4 |
| **Total** | **43** | **378** |

Le rig de Riva n’utilise plus un corps complet fusionné : tête, torse, bassin, deux bras supérieurs, deux avant-bras dont `forearm-near`, le canon indépendant `cannon-near`, deux cuisses, deux tibias et deux bottes forment quatorze pièces anatomiques. Deux couches d’effet — traînée de ruée et halo de Surcharge — portent le total héroïne à seize. Les treize liens parent–enfant forment une hiérarchie sans cycle ; la remontée de route vaut `10 px` et la hurtbox reste volontairement tolérante sur le bas du corps.

Les offsets visuels `+80` (campagne) et `+28` (Forge) rapprochent les routes peintes du sol physique `620` sans altérer la simulation. Chaque machine Forge possède sept pièces animées ; chaque arène Forge expose quatre couches parallaxe et garde les télégraphes lisibles.

Le rendu Canvas reste disponible si une image manque ou ne se décode pas. Le service worker garde le shell et le manifeste artistique, puis met les WebP utiles en cache à la demande au lieu de précacher les 378 fichiers.

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

Le workflow CI Node 22.x a réussi sur la v2.9.1. Playwright a exécuté Chromium desktop et un profil mobile tactile ; Firefox et WebKit restent configurés en opt-in et n’ont pas été exécutés pour cette release.

Pour v2.10.0, la validation locale compte 84/84 tests Node, `npm run qa` vert, un audit npm sans vulnérabilité et un audit agent-browser Chrome desktop/mobile sans erreur console. La CI distante ajoute 26 parcours Chromium réussis, 2 ignorés et 0 échec ; Vercel est `READY` et l’alias public répond en HTTP 200.


Le fichier `tests/e2e/forge.spec.mjs` couvre :

- l’ouverture du menu et de la Forge, la grille de 30 cartes et l’absence de débordement horizontal ;
- les diagnostics du rig natif de Riva, de ses treize pièces anatomiques et de son contact au sol déclaré ;
- les 24 boss Forge lancés dans leurs trois phases, soit 72 états de démarrage ;
- le démarrage du Circuit Forge et la création de son premier checkpoint.

Le fichier `tests/e2e/accessibility.spec.mjs` couvre en Chromium :

- l’ouverture des options au clavier, l’ordre du focus et les cibles de 44 CSS px ;
- le téléchargement de l’export JSON v6 et l’import d’un JSON normalisé ;
- l’initialisation mouvement réduit/contraste renforcé sur une sauvegarde neuve ;
- la navigation de menu par Gamepad API simulée ;
- le rechargement hors ligne d’un shell déjà installé.

La CI v2.9 a exécuté 13 parcours Chromium avec succès et en a ignoré un conformément à sa garde. Ils ne remplacent pas les tests matériels de manette, tactile, lecteur d’écran ou mobile bas de gamme. Le consentement face à un worker réellement `waiting` reste couvert par les contrats Node, pas par un E2E navigateur ; les six manches complètes d’ENDURANCE ENGINE ne sont pas encore parcourues en E2E. Firefox et WebKit restent configurés mais non exécutés pour cette release.

## Qualité et build

La porte de qualité exécutée localement et en CI est :

```text
npm run qa
```

La matrice Chromium exécutée en CI est :

```text
npm run test:e2e
```

La matrice Firefox/WebKit reste opt-in :

```text
npm run test:e2e:cross-browser
```

Les contrôles ciblés restent `npm test`, `npm run build` et `npm run check:release`. `QA_REPORT.md` consigne les validations réellement exécutées, la CI verte, le déploiement Ready et les limites de preuve matérielle.

## Structure

- `index.html`, `styles.css`, `game.js` : jeu et interface.
- `story.js` : campagne narrative des six districts.
- `expansion-story.js` : quatre vagues Forge, journaux, objectifs et 72 contrats instrumentés.
- `boss-roster.js` : registre des 30 machines, 24 `mechanicId`, 72 états Forge et huit familles partagées.
- `assets/generated/v2.11.0/` : pack runtime de 378 WebP et manifeste de provenance/assemblage.
- `manifest.webmanifest`, `sw.js` : installation et fonctionnement hors ligne.
- `server.js` : serveur local à surface publique restreinte.
- `scripts/` : build, contrats et garde-fous de release.
- `tests/` : contrats Node et parcours Playwright.
- `DESIGN.md`, `GAME_DESIGN.md` et `GAME_AUDIT.md` : règles, intégration et audit courant.

Projet original. Tous droits réservés.
