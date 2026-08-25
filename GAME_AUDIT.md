# Audit professionnel du jeu — v2.10.0

Date : 25 août 2026

## Verdict courant

GEARSTORM v2.10.0 est validé et publié comme boss rush complet de 30 machines et 90 phases. La passe ferme les incohérences de canon, de sauvegarde, de cache, de signaux non chromatiques, de maîtrises causales et de focus relevées dans l’audit avant/après. GitHub Actions est vert et la production Vercel est `READY`.

Le canon articulé de Riva suit désormais sa transformation complète avec une erreur maximale observée d’environ `1,32 × 10⁻16`. Son point d’émission est `[149, 297]`, le recul vaut `12 px` dans l’espace local et `13,2 px` sur le Canvas. `forearm-cannon-near` est un asset combiné avant-bras–canon, pas un canon indépendant ajouté à un avant-bras distinct.

## État factuel v2.10.0

| Surface | État observé |
| --- | --- |
| Contenu | 30 boss, 90 phases, 90 contrats de maîtrise |
| Art | 42 masters, 233 WebP runtime, 18 175 510 octets |
| Build | `dist/` : 21 735 065 octets |
| Riva | `roadLift = 10`, `headDrop = 4`, poussière `y = 610` |
| Narration | 9 transmissions, 4 révélations, 24 journaux, 72 voix Forge |
| Tests | 84/84 Node ; `npm run qa` vert ; audit npm 0 vulnérabilité |
| Audit Chrome | 1440 × 900 et 412 × 915 ; 12 captures avant + 12 après |
| Accessibilité | axe : 0 violation Codex desktop et combat mobile ; gradient Canvas indéterminé |
| Publication distante | `b65b027` + `bc0129a`, CI `32871248113` verte, Vercel `dpl_AgHpmCoLwomtZ6Xj51LcThcZdha9` `READY`, HTTP 200 |

## Corrigé dans la v2.10.0

- Canon : projectile et museau transformé restent alignés au repos, en course, en saut et pendant le recul.
- Perspective : Riva reste remontée de `10 px`, la tête est abaissée de `4 px` et la poussière rejoint la route à `610`.
- Lore : Couronne abolie, Cassian détenu, M-0 publique et distribuée ; Forge canonique après la campagne, Catalogue libre hors chronologie.
- Archives : neuf transmissions relisibles, quatre révélations d’anneau, vingt-quatre journaux et soixante-douze voix de phase.
- Sauvegarde : récupération d’une v4 valide sous v5 corrompue, normalisation des campagnes terminées et checkpoints finaux, tolérance au quota lors de la migration.
- PWA et mémoire : écritures cache best-effort et LRU de trois bundles de boss sans expulsion du rig de Riva.
- Lisibilité : voies hachurées et nommées, séquences par formes et numéros, réserve chiffrée et environnements fléchés.
- Maîtrise : cinq contrats Forge contextuels reposent sur l’événement causal exact, jamais sur un proxy global.
- Focus : le retour des Options restaure `#settings` hors de l’arbre `inert`.

## Risques restant

### P0

Aucun bloqueur P0 n’a été démontré sur l’état assemblé ou sur la gate distante finale. La première CI a exposé une assertion mobile sensible à la durée de 190 ms de la ruée ; sa lecture atomique est corrigée dans `bc0129a` et le run `32871248113` est vert.

### P1

- Aucun test sur manette, tactile physique, lecteur d’écran réel, Firefox ou WebKit.
- Portrait mobile fonctionnel mais paysage recommandé.
- Records non segmentés par mode, difficulté et version.
- 24 backdrops Forge monocouches et rigs Forge limités à quatre pièces.
- 24 profils spécialisés au-dessus de huit familles moteur partagées.

### P2

Une passe audio, des tests matériels et des playtests prolongés restent nécessaires avant toute revendication de validation commerciale exhaustive.

## Limites de preuve

Les preuves comprennent 84 tests Node, gates de build, audit npm, agent-browser Chrome, axe, console, 24 captures, 26 parcours Chromium distants réussis, GitHub Actions vert et Vercel `READY`. Le contraste du gradient Canvas reste indéterminé par axe et les limites matérielles ci-dessus restent hors preuve.

Les captures et mesures sont indexées dans [`docs/audits/v2.10.0/`](docs/audits/v2.10.0/README.md).

---

# Annexe historique — audit v2.9.1 conservé intégralement

# Audit professionnel du jeu — v2.9.1

Date : 25 août 2026
Portée : revue du code, des données et du manifeste, exécution locale des gates, audit Chrome desktop/mobile, CI Chromium sous Node 22 et vérification du déploiement Vercel. Aucun test matériel n’est revendiqué.

## Verdict

GEARSTORM est un boss rush web structuré et largement jouable, et non un simple prototype d’écran. Le contenu déclaré est cohérent dans ses sources : 30 boss, 90 phases et 90 contrats de maîtrise. La campagne de six machines, le Laboratoire, la Forge libre et le Circuit Forge 07–30 disposent de progressions séparées, d’une sauvegarde v5, de modules, de difficultés, de fins et d’un registre narratif.

La v2.9.1 ferme les écarts d'assemblage reproduits sur Riva : ses treize pièces anatomiques suivent une hiérarchie réelle à racine `pelvis`, le canon ne traverse plus le torse, les appuis alternent et les poses saut/tir/ruée restent lisibles. Riva et son ombre sont remontées de `10 px` sur la chaussée peinte ; le sol de simulation reste inchangé à `y = 620`.

L'intro, le prologue et les communications de phase portent désormais leur regard méta par Riva, Cassian et les relais civils. Chaque intervention apporte du lore, un enjeu ou une information de mission ; aucune voix générique « Système » ne parle à la joueuse. Les tutoriels, aides et objectifs critiques restent non méta.

Le jeu ne doit toutefois pas encore être qualifié de release commerciale matériellement validée. Les 24 boss Forge spécialisent huit familles partagées, l’audio reste synthétique, les records ne sont pas segmentés, les contrôles n’ont pas été certifiés sur appareils physiques et le portrait mobile reste une présentation contrainte pour laquelle le paysage est recommandé.

## État factuel v2.9.1

| Surface | État observé |
| --- | --- |
| Roster | 6 boss campagne + 24 boss Forge = 30 |
| Phases | 3 par boss = 90 |
| Maîtrise | 18 contrats campagne + 72 contrats Forge = 90 |
| Forge | 4 vagues de 6 boss ; sélection libre séparée |
| Mécaniques Forge | 24 `mechanicId`, 72 signatures, 8 familles moteur partagées |
| Sauvegarde | Schéma local v5, migrations et normalisation conservées |
| Art | Manifeste v2.9.1, 42 masters, 233 WebP runtime, 18 175 510 octets |
| Audio | Web Audio synthétique, sans banque sonore distante |
| E2E présents | Chromium desktop/mobile : rig, grille 30, matrice 24 × 3, checkpoint Forge, accessibilité, sauvegarde portable, Gamepad simulé et offline |
| Publication | Commit `8bd2b29` sur `main`, CI `32789460141` verte, Vercel `dpl_7mKBMcfvbHcXF4mevKm4RYUNEdG5` Ready et alias public HTTP 200 |

## Corrigé dans la v2.9.1

- Rig hiérarchique de Riva : treize pièces anatomiques, traînée et halo séparés ; `pelvis` est l'unique racine et les douze liens parent–enfant sont acycliques.
- Assemblage recalé : tête, torse, bassin, bras et avant-bras-canon restent séparés ; le museau suit la transformation finale du canon.
- Animation : course à appuis alternés, montée/sommet/chute/réception distincts, visée et recul visibles, ruée lisible même pendant l'invulnérabilité.
- Placement : remontée purement visuelle de `10 px`, ombre comprise, sans mutation du sol physique `620` ni de la hurtbox tolérante.
- Perspective : offsets de rendu `+80 px` pour les arènes campagne et `+28 px` pour les backdrops Forge, sans mutation du sol physique `620`.
- Pack OpenAI courant : 48 assets d’arène, 150 de boss, 15 héroïne, 16 VFX et 4 narratifs.
- Contenu : 24 interludes et 24 `metaLine` persistants dans le Codex, panorama des quatre anneaux et transmission Forge au résultat.
- Ton : récit méta mais diégétique et utile ; tutoriels, aide, accessibilité et objectifs critiques maintenus factuels.

Ces points sont confirmés par les contrats automatisés, les [captures Chrome avant/après](docs/audits/v2.9.1/README.md), les diagnostics du rig, la CI et les contrôles HTTP consignés dans `QA_REPORT.md`.

## Fiabilité héritée de la v2.8.0

### Gameplay et équité

- ENDURANCE ENGINE impose six manches internes. Les seuils de phase sont verrouillés jusqu’aux manches 2 et 4, et la fin jusqu’à la manche 6.
- Les snapshots campagne et Forge conservent `currentBossRetries`. Une reprise restaure donc la pénalité de tentative du boss courant au lieu de repartir dans un état plus favorable.
- Le checkpoint `upgrade` conserve `upgradeOffer`. Les trois modules visibles restent identiques après rechargement et ne peuvent plus être relancés en rechargeant la page.

### Sauvegarde et qualité de vie

- L’export sérialise une copie JSON v5 passée par `normalizeSaveData`.
- L’import refuse les fichiers de plus de 1 Mio, parse le JSON sans l’injecter dans le DOM, normalise/migre les données, puis resynchronise réglages, grille, Codex, archives et reprises.
- Les erreurs sont annoncées par toast et région accessible sans afficher les données brutes du fichier.
- Sur une sauvegarde réellement neuve, mouvement réduit et contraste renforcé sont initialisés depuis les préférences du système. Les sauvegardes existantes et migrées conservent leurs choix.

### Présentation et PWA

- Les cartes déverrouillées ajoutent une miniature décorative depuis les WebP réels ; les cartes verrouillées n’exposent pas l’image et le texte accessible reste autonome.
- Le runtime PWA distingue première installation et mise à jour. Un worker en attente ne reçoit `SKIP_WAITING` qu’après activation explicite du hook `#update-app`, puis `controllerchange` ne recharge qu’une seule fois.
- Les options rendent les actions d’import/export et l’input JSON masqué ; le bouton de mise à jour est présent mais reste masqué jusqu’à la détection d’un worker en attente. Les écouteurs runtime restent tolérants si un hook manque.

## Forces actuelles

### Jeu et contenu

- Deux parcours séquentiels complets : six relais de campagne et 24 machines des quatre anneaux.
- Trois phases par boss, télégraphes, ouvertures de noyau, Surcharge, ruée, double saut, score, rangs et trois difficultés.
- Onze modules avec limites de cumul, résultats détaillés, fins séparées et reprises aux checkpoints.
- Forge libre pour l’entraînement sans pollution de la progression narrative ou du Circuit Forge.
- 90 contrats de maîtrise, dont les 72 contrats Forge instrumentés avec échec ferme si une métrique manque.

### Narration et cohérence

- Intro, prologue, six actes, interludes et épilogues dérivés de registres structurés.
- Arc clair : Riva restaure les services civils par M-0 et refuse une nouvelle centralisation.
- Séparation correcte entre progression, connaissance Codex, Laboratoire et Forge.

### Visuel et robustesse

- Pack runtime v2.9 de 233 WebP avec provenance, dimensions, alpha, poids et SHA-256.
- Six arènes de campagne à quatre couches, 24 backdrops Forge, 150 pièces de boss, 15 assets Riva, 16 VFX et 4 images narratives.
- Lazy loading, cache à la demande et fallback Canvas si une image manque.
- Le rig natif de Riva sépare treize pièces anatomiques ; ses bottes déclarent et mesurent leur contact alpha sur `feetLocalY = 36`.

### Accessibilité et automatisation disponibles

- Réglages manuels de mouvement réduit, contraste, secousses, volume et conseils.
- Règles CSS pour `prefers-reduced-motion`, `prefers-contrast`, tactile et orientation.
- Régions d’annonce, objectifs textuels et informations qui ne reposent pas uniquement sur la couleur.
- Tests Node couvrant assets, contrats, narration, release, serveur et service worker.
- Configuration Playwright par défaut pour Chromium desktop et mobile tactile ; Firefox/WebKit existent en opt-in mais ne sont pas revendiqués comme exécutés.
- E2E Forge présents pour la grille de 30 boss, le rig de Riva, le débordement horizontal, les 72 lancements de phases et le premier checkpoint.
- E2E accessibilité présent pour le focus clavier, les cibles de 44 CSS px, l’export téléchargé, l’import normalisé, les préférences système first-run, le Gamepad simulé et le rechargement offline.
- Contrats Node présents pour le consentement PWA face à un worker `waiting`.
- Workflow GitHub Actions exécuté sous Node 22.x pour QA, navigateur et audit de dépendances.

Sur l’état final v2.9.1, la CI a exécuté 76/76 tests Node et 13 parcours Chromium réussis avec un test ignoré ; l’audit npm n’a trouvé aucune vulnérabilité.

## Risques restant — P0

Aucun bloqueur gameplay P0 supplémentaire n’a été démontré après les gates locales, la CI Chromium et les vérifications publiques du périmètre corrigé.

La release logicielle est validée et publiée. Une qualification matérielle complète reste distincte : manettes réelles, appareils tactiles, lecteurs d’écran, Safari/iOS, Android bas de gamme et sessions de jeu prolongées ne sont pas couverts par cette sortie.

## Risques restant — P1

### 1. Huit familles partagées

Les 24 boss Forge ont des identifiants, valeurs, signatures, objectifs et visuels propres, mais leurs comportements secondaires restent construits sur huit familles. La variété est réelle sans être équivalente à 24 architectures entièrement indépendantes.

Action recommandée : tester les rencontres en aveugle, mesurer la répétition perçue par vague et ajouter des verbes vraiment exclusifs seulement là où deux boss restent trop proches.

### 2. Cas d’erreur de portabilité et worker en attente

Le parcours Chromium télécharge l’export JSON v5, injecte un fichier d’import valide et vérifie l’application des données normalisées. Il ne couvre pas encore un JSON malformé, un fichier supérieur à 1 Mio ou un worker réellement `waiting`. Ce dernier consentement est vérifié par contrats Node, pas en navigateur.

Action recommandée : ajouter des E2E de refus et d’import surdimensionné, ainsi qu’une simulation maîtrisée du cycle `waiting → consentement → controllerchange`.

### 3. Records non segmentés

Les meilleurs temps et classements locaux ne sont pas suffisamment segmentés par mode, difficulté et version d’équilibrage. Une performance dans un contexte peut donc être comparée à une autre qui n’a pas les mêmes règles.

Action recommandée : versionner les catégories de records et migrer sans écraser les historiques existants.

### 4. Audio synthétique limité

Web Audio garantit l’autonomie et un poids faible, mais l’identité sonore, la profondeur musicale et le mix restent limités. Il n’existe pas encore de bus distincts musique/effets/voix, de ducking élaboré ni de mode mono documenté.

Action recommandée : créer une passe audio dédiée tout en conservant le fallback synthétique.

### 5. Absence de validation matérielle

Les simulations navigateur ne remplacent pas une vraie manette, un écran tactile, un lecteur d’écran, Safari/iOS, Android bas de gamme, un écran à faible fréquence ou une connexion instable.

Action recommandée : établir une matrice d’appareils, tester les 30 boss au moins par vagues et conserver les preuves dans `QA_REPORT.md`.

### 6. Mobile portrait contraint

Le portrait étroit est pris en charge par une mise en page et un conseil d’orientation, mais la largeur tactique diminue et la densité HUD/commandes augmente. Le paysage reste recommandé.

Action recommandée : mesurer occlusion, taille des cibles, visibilité des télégraphes et stabilité du framerate sur appareils physiques ; ne pas vendre le portrait comme présentation optimale sans ces preuves.

### 7. Couverture E2E encore partielle

La matrice actuelle vérifie aussi l’import/export nominal, le focus, les préférences système, un Gamepad simulé et le rechargement offline. Elle ne vérifie pas encore la possibilité de terminer les 30 boss, les six manches d’ENDURANCE ENGINE, une campagne complète, les trois difficultés, les refus d’import, le worker PWA réellement en attente ni chaque contrat de maîtrise en navigateur.

Action recommandée : ajouter des scénarios déterministes ciblés plutôt qu’un unique parcours monolithique.

## Risques restant — P2

- Historique des runs, splits par boss, replays de seed et builds favoris.
- Défis quotidiens/hebdomadaires et classements uniquement avec une politique anti-triche explicite.
- Localisation structurée, remappage complet, préréglages de contrôle et haptique.
- Synchronisation cloud facultative avec résolution de conflits ; l’import/export local doit rester disponible.
- Backdrops Forge parallaxe multicouches seulement si le budget mémoire et le gain visuel le justifient.
- Captures PWA issues du gameplay réel et non uniquement du key art.

## Plan de fermeture recommandé

1. Ajouter les E2E d’erreur d’import et du consentement face à un worker réellement en attente.
2. Ajouter un test déterministe des manches 1 à 6 d’ENDURANCE ENGINE et des reprises `fight`/`upgrade`.
3. Segmenter les records par mode, difficulté et version d’équilibrage.
4. Conserver la matrice automatisée verte sur chaque changement de `main` et consigner uniquement les résultats observés.
5. Tester tactile, manette, lecteur d’écran, paysage/portrait et performances sur matériel réel.
6. Réaliser une passe audio et une passe de différenciation des boss guidées par les retours de jeu.
7. Surveiller la publication Vercel et les en-têtes publics après chaque nouvelle version.

## Limites de preuve

Cette révision s’appuie sur l’état publié le 25 août 2026. Les commandes locales, la CI GitHub, Vercel Ready et les réponses HTTP publiques sont vérifiées ; les tests matériels, Firefox/WebKit et les playtests humains prolongés restent hors preuve.
