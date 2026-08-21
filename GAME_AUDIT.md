# Audit professionnel du jeu — v2.8.0

Date : 21 août 2026
Portée : revue statique du code, des données, des documents, du manifeste artistique et des surfaces de tests présentes dans le dépôt. Cet audit ne constitue ni une exécution finale de QA, ni un test matériel, ni une vérification de déploiement.

## Verdict

GEARSTORM est un boss rush web structuré et largement jouable, et non un simple prototype d’écran. Le contenu déclaré est cohérent dans ses sources : 30 boss, 90 phases et 90 contrats de maîtrise. La campagne de six machines, le Laboratoire, la Forge libre et le Circuit Forge 07–30 disposent de progressions séparées, d’une sauvegarde v5, de modules, de difficultés, de fins et d’un registre narratif.

La v2.8.0 corrige plusieurs écarts de fiabilité réels : ENDURANCE ENGINE ne peut plus être court-circuité, les checkpoints préservent retries et offres d’Atelier, les préférences système s’appliquent au premier lancement, les cartes utilisent les assets réels et les chemins runtime d’import/export et de mise à jour PWA sont normalisés et consentis.

Le jeu ne doit toutefois pas encore être qualifié de release commerciale matériellement validée. Les 24 boss Forge spécialisent huit familles partagées, l’audio reste synthétique, les records ne sont pas segmentés, les contrôles n’ont pas été certifiés sur appareils physiques et le portrait mobile reste une présentation contrainte pour laquelle le paysage est recommandé.

## État factuel v2.8.0

| Surface | État observé |
| --- | --- |
| Roster | 6 boss campagne + 24 boss Forge = 30 |
| Phases | 3 par boss = 90 |
| Maîtrise | 18 contrats campagne + 72 contrats Forge = 90 |
| Forge | 4 vagues de 6 boss ; sélection libre séparée |
| Mécaniques Forge | 24 `mechanicId`, 72 signatures, 8 familles moteur partagées |
| Sauvegarde | Schéma local v5, migrations et normalisation conservées |
| Art | Manifeste v2.7.0 inchangé, 26 masters de provenance, 225 WebP runtime |
| Audio | Web Audio synthétique, sans banque sonore distante |
| E2E présents | Chromium desktop/mobile : rig, grille 30, matrice 24 × 3, checkpoint Forge, accessibilité, sauvegarde portable, Gamepad simulé et offline |
| Publication | Non vérifiée dans cette revue |

## Corrigé dans la v2.8.0

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

- Pack runtime immuable de 225 WebP avec provenance, dimensions, alpha, poids et SHA-256.
- Six arènes de campagne à quatre couches, rigs des boss historiques, 24 backdrops et 96 pièces Forge, rig cohérent de Riva et 16 VFX.
- Lazy loading, cache à la demande et fallback Canvas si une image manque.
- Le corps de Riva est composé une seule fois, son bras-canon est indépendant et ses semelles suivent le sol logique.

### Accessibilité et automatisation disponibles

- Réglages manuels de mouvement réduit, contraste, secousses, volume et conseils.
- Règles CSS pour `prefers-reduced-motion`, `prefers-contrast`, tactile et orientation.
- Régions d’annonce, objectifs textuels et informations qui ne reposent pas uniquement sur la couleur.
- Tests Node couvrant assets, contrats, narration, release, serveur et service worker.
- Configuration Playwright par défaut pour Chromium desktop et mobile tactile ; Firefox/WebKit existent en opt-in mais ne sont pas revendiqués comme exécutés.
- E2E Forge présents pour la grille de 30 boss, le rig de Riva, le débordement horizontal, les 72 lancements de phases et le premier checkpoint.
- E2E accessibilité présent pour le focus clavier, les cibles de 44 CSS px, l’export téléchargé, l’import normalisé, les préférences système first-run, le Gamepad simulé et le rechargement offline.
- Contrats Node présents pour le consentement PWA face à un worker `waiting`.
- Workflow GitHub Actions prévu pour Node 22.x, QA, navigateur et audit de dépendances.

L’existence de ces fichiers ne prouve pas qu’ils ont tous réussi sur le candidat v2.8.0.

## Risques restant — P0

Aucun bloqueur gameplay P0 supplémentaire n’a été démontré par cette revue statique dans le périmètre corrigé.

La release reste cependant non certifiable tant que les portes réelles n’ont pas été exécutées sur l’état final assemblé : vérification syntaxique, tests Node, build, contrôle de release, E2E navigateur, audit de dépendances, inspection responsive, puis état Git et déploiement public. Ce sont des preuves de sortie manquantes, pas une affirmation de bug.

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
4. Exécuter la matrice automatisée sur l’état final et consigner uniquement les résultats observés.
5. Tester tactile, manette, lecteur d’écran, paysage/portrait et performances sur matériel réel.
6. Réaliser une passe audio et une passe de différenciation des boss guidées par les retours de jeu.
7. Ne déclarer la publication terminée qu’après commit, push, déploiement prêt et requête HTTP publique vérifiée.

## Limites de preuve

Cette révision de `GAME_AUDIT.md` remplace l’audit v2.5 devenu obsolète. Elle s’appuie sur les fichiers présents le 21 août 2026 et distingue explicitement code disponible, interface exposée et preuve exécutée. Aucun résultat de commande, statut GitHub, statut Vercel, test matériel ou disponibilité publique n’est revendiqué ici.
