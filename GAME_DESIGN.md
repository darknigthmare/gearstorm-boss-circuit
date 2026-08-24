# GEARSTORM: Boss Circuit — conception de production 2.9.0

`DESIGN.md` reste la source de vérité des règles et `story.js` celle des scènes, actes, transmissions, dossiers Codex et contrats de maîtrise. `expansion-story.js` et `boss-roster.js` étendent ce contrat à la Forge. Ce document fixe leur intégration de production, de narration interactive et d’UX pour la version applicative 2.9.0.

## Invariants de jeu

- Le roster contient exactement 30 identifiants stables et 90 phases : six boss de campagne et 24 boss Forge, trois phases chacun.
- Les contrats totalisent exactement 90 objectifs : 18 en campagne et 72 dans la Forge.
- La campagne choisit un module après chacune des cinq premières victoires.
- Le Circuit Forge comporte quatre vagues de six boss, des améliorations entre les rencontres, une reprise v5 et une fin dédiée.
- Les télégraphes restent lisibles avant toute collision dangereuse.
- Une illustration ou un texte d’aide ne modifie jamais les hitboxes, timings, seuils de phase ou données de sauvegarde.
- Clavier, souris, tactile et manette conservent la même priorité fonctionnelle.
- Le fallback procédural reste une voie jouable, pas un écran d’erreur.
- L’objectif critique demeure visible même lorsque les conseils contextuels sont désactivés.
- Une victoire de Laboratoire peut enrichir le Codex, mais ne libère jamais un relais de campagne.
- La Forge libre n’avance ni la campagne ni le Circuit Forge.

## Extension Forge

Les 24 extensions sont jouables en sélection libre et dans le Circuit Forge 07–30. Vingt-quatre `mechanicId` et 72 signatures d’état uniques spécialisent huit familles mécaniques communes : renvoi, leurre, modules, mimétisme, voies/verticalité, gravité/météo, posture/duo et puzzle/endgame. Cette mutualisation est un invariant explicite ; le jeu ne revendique pas 24 moteurs physiques sans code partagé.

Chaque profil charge quatre pièces et un backdrop depuis le pack artistique v2.9.0, avec fallback procédural. Les 72 contrats Forge utilisent la télémétrie de la tentative et échouent si leur mesure est inconnue.

Chaque profil définit également un interlude et une `metaLine`. Après déverrouillage, ces deux niveaux de lecture restent accessibles dans le Codex sous l’un des quatre anneaux ; les résultats réaffichent la transmission du boss neutralisé. Les tutoriels, aides et objectifs critiques restent volontairement factuels.

### Règle spéciale d’ENDURANCE ENGINE

ENDURANCE ENGINE déroule six manches internes. La jauge de vie ne peut franchir la limite de la phase 1 qu’après la manche 2, celle de la phase 2 qu’après la manche 4, et les derniers points de vie ne peuvent être retirés qu’après la manche 6. Le verrou est vérifié au moment des dégâts : une forte puissance offensive n’autorise pas un saut de cycle.

## Progression narrative des six districts

Voltério a relié six infrastructures civiles à autant de relais de sécurité, puis centralisé leurs commandes dans la Couronne. Chaque machine verrouille un district et l’accès physique au suivant.

| Étape | District | Machine | Enjeu | Conséquence |
| ---: | --- | --- | --- | --- |
| 01 | Rocade des Rivets | Rivet Rex | Transport, signalisation et convois | La Rocade redevient publique ; Cassian identifie Riva et M-0. |
| 02 | Couloir des Hautes-Tensions | Sky Slicer | Énergie et communications | Le courant et les canaux civils reviennent ; l’apprentissage adaptatif apparaît. |
| 03 | Fosse Ferromagnétique | Magnetron | Fret, rails et évacuations | Les trains repartent ; Riva découvre son dossier d’entraînement. |
| 04 | Horloge de la Faille | Chrono Mantis | Horodatages et archives | Les archives prouvent le verrouillage planifié et révèlent l’inversion M-0. |
| 05 | Fournaise des Pistons | Foundry Titan | Production et alimentation industrielle | Riva injecte la contre-phase qui remonte vers la Citadelle. |
| 06 | Citadelle Voltério | Crown Engine Ω | Coordination et sécurité | La Couronne perd son exclusivité ; chaque district récupère ses commandes. |

Riva gagne grâce à sa connaissance du réseau, sa lecture des cycles et l’adaptation de son équipement. Cassian transforme ses échecs en données pour une Couronne adaptative ; Riva lui fournit volontairement une fausse solution, la contre-phase M-0, qui neutralise son commandement sans arrêter les services.

## Parcours complets

1. Le titre expose l’état de campagne, la prochaine cible et les entrées Circuit, reprise, Laboratoire, Forge, Codex, manuel et options.
2. L’intro montre la prise de contrôle de la Couronne et l’interruption des six services civils.
3. Le prologue active la ligne M-0, fixe l’objectif des six relais et présente l’itinéraire.
4. L’intro de machine présente fonction civile, district, silhouette et voix.
5. Le combat maintient un objectif bref, nomme chaque phase et peut ajouter un conseil contextuel.
6. La pause rappelle objectif, build et commandes.
7. Le résultat relie performance, build, journal de Riva et conséquence locale.
8. L’interlude confirme la restauration et ouvre l’étape suivante.
9. Après les cinq premiers boss, l’Atelier propose un module parmi onze.
10. Après Crown Engine Ω, l’épilogue place Cassian en détention et distribue les commandes.
11. Le Codex et les archives M-0 conservent les informations réellement découvertes.

Le Circuit Forge constitue un second parcours complet : FORGE 07, six combats par vague, choix de module entre les boss, checkpoint après chaque étape, puis restauration finale après FORGE 30.

## Contrat des hooks UX

Tous les IDs historiques restent stables. Les hooks v2.9 ne changent pas la logique du jeu par CSS.

| Hook | État initial | Comportement requis |
| --- | --- | --- |
| `#story-screen`, `#story-dialogue` | Écran fermé | Présenter intro ou interlude depuis `story.js`. |
| `#story-continue`, `#story-back` | Actions visibles | Avancer ou revenir au menu par une action explicite. |
| `#continue-run` | `hidden` | N’apparaître qu’avec une reprise campagne valide et restaurer son checkpoint. |
| `#continue-forge` | `hidden` | N’apparaître qu’avec une reprise Forge valide et restaurer son checkpoint. |
| `#campaign-progress`, `#campaign-next` | Nouveau jeu | Refléter districts libérés, prochaine cible et complétion. |
| `#codex`, `#codex-screen` | Écran fermé | Ouvrir/fermer le Codex et restituer le focus. |
| `#codex-grid`, `#codex-progress` | Aucun dossier de victoire | Synchroniser état, origine civile, détournement, lecture et impact. |
| `#combat-objective` | Masqué hors combat | Décrire l’action nécessaire pour le boss ou la phase. |
| `#radio-comms`, `#radio-speaker`, `#radio-line` | Masqués | Exposer une communication temporaire sans recouvrir le HUD. |
| `#combat-hint`, `#hints-toggle` | Conseil activé | Masquer seulement les conseils, jamais l’objectif. |
| `#pause-objective`, `#pause-build` | Replis textuels | Reprendre objectif et build réels. |
| `#result-lore`, `#result-build`, `#result-mastery` | Replis/containeur vide | Afficher conséquence, build et contrats réellement évalués. |
| `#forge-rush-start`, `#forge-run-summary`, `#forge-wave-progress` | Nouveau Circuit | Lancer FORGE 07 et exposer vague, progression, build et prochaine étape. |
| `#forge-ending-screen` | Écran fermé | Résumer les quatre anneaux, le temps et le build après FORGE 30. |
| `#result-forge-transmission`, `#result-forge-transmission-label`, `#result-forge-transmission-copy` | Masqués hors résultat Forge | Afficher l’interlude et la lecture hors cadre du profil neutralisé. |
| `#forge-codex-section`, `#forge-codex-progress`, `#forge-codex-grid`, `#forge-codex-empty` | Codex vide ou partiel | Organiser les 24 transmissions persistantes et le panorama des quatre anneaux. |
| `#export-save` | Action visible | Télécharger une copie JSON v5 normalisée de la sauvegarde. |
| `#import-save` | Action visible | Ouvrir explicitement le sélecteur de fichier. |
| `#import-save-file` | Input fichier masqué | Accepter le JSON et transmettre le fichier au pipeline d’import validé avec un libellé accessible. |
| `#update-app` | Masqué | Se révéler uniquement pour une mise à jour en attente d’une application déjà contrôlée. |

Ces hooks sont rendus dans `index.html` et requis par le contrat applicatif v2.9. Les écouteurs runtime restent néanmoins tolérants à leur absence afin de ne pas bloquer un repli partiel de l’interface.

## Contrat des cartes de boss

Chaque carte conserve son texte et son `aria-label`. Une carte déverrouillée peut ajouter `img.boss-card-art` avec `alt=""` et `aria-hidden="true"` ; une carte verrouillée n’insère aucune miniature.

- Boss Forge : `assets/generated/v2.9.0/bosses/{id}/chassis.webp`.
- Rivet Rex : `rammer/chassis.webp`.
- Sky Slicer : `kraken/fuselage.webp`.
- Magnetron : `drill/carapace.webp`.
- Chrono Mantis : `mantis/torso.webp`.
- Foundry Titan : `cyclotron/furnace-torso.webp`.
- Crown Engine Ω : `omega/crown-hull.webp`.

L’échec de chargement d’une miniature ne bloque ni la sélection ni la lecture du nom.

## Contrat de sauvegarde v5

La sauvegarde locale v5 migre les données anciennes sans effacer la campagne et sépare explicitement les deux Circuits :

- `campaignCleared` contient uniquement les machines neutralisées en campagne ;
- `storySeen` mémorise les scènes effectivement traversées ;
- `codexUnlocked` reste indépendant de la libération des relais ;
- `mastery` associe uniquement les contrats réellement validés ;
- `rushSnapshot.checkpoint` distingue `fight`, `interlude` et `upgrade` ;
- `forgeCleared`, `forgeCompleted` et `bestForgeRush` portent l’historique Forge ;
- `forgeRushSnapshot` distingue `fight`, `upgrade` et `ending`.

Les snapshots de campagne et de Forge conservent `currentBossRetries`. Un snapshot `upgrade` conserve aussi `upgradeOffer`, normalisée contre les modules connus et leurs limites. La reprise restaure les tentatives avant de recalculer la pénalité et réutilise l’offre sauvegardée au lieu d’en tirer une nouvelle.

L’export sérialise `normalizeSaveData(save)` en JSON v5. L’import :

1. refuse l’absence de fichier et les fichiers supérieurs à 1 Mio ;
2. parse le JSON sans l’injecter dans le DOM ;
3. appelle `normalizeSaveData`, qui porte aussi la migration ;
4. persiste le résultat normalisé ;
5. réapplique les réglages et resynchronise grille, Codex, archives et reprises ;
6. annonce le succès ou refuse le fichier sans exposer son contenu brut.

La sauvegarde reste locale au navigateur : aucune synchronisation cloud ou interappareil n’est revendiquée.

## Onboarding et accessibilité

- L’intro et le prologue expliquent l’objectif avant le premier combat.
- Les conseils restent courts, facultatifs et séparés de l’objectif critique.
- Les changements importants utilisent des annonces polies et atomiques ; les valeurs par frame ne sont pas annoncées.
- Le Codex conserve une hiérarchie de titres et des états textuels, sans dépendre de la couleur seule.
- La pause est un dialogue modal.
- Le contraste renforcé et `prefers-contrast` durcissent bordures et fonds ; le mouvement réduit neutralise les animations non essentielles.
- Une sauvegarde neuve initialise ces deux préférences depuis `matchMedia`. Les sauvegardes existantes et migrées préservent leurs réglages manuels.
- Les cibles tactiles visent au moins 44 × 44 CSS px.
- En portrait étroit, un conseil recommande le paysage ; le portrait reste un mode contraint et non la présentation tactique de référence.

## Contrat artistique v2.9.0

Les 42 masters originaux produits avec OpenAI Image Generation alimentent 233 assets runtime indépendants dans le manifeste 2.9.0, pour 18 175 510 octets.

| Famille | Contrat | Masters | Assets runtime |
| --- | --- | ---: | ---: |
| Arènes de campagne | Quatre couches de parallaxe | 6 | 24 |
| Boss de campagne | Neuf pièces articulables | 6 | 54 |
| Boss Forge 07–30 | Quatre pièces par machine | 4 planches | 96 |
| Arènes Forge 07–30 | Un backdrop par machine | 6 planches | 24 |
| Riva Spark | Treize pièces anatomiques et deux effets | 15 | 15 |
| VFX | Seize effets isolés | 1 | 16 |
| Narration | Intro, prologue et deux fins | 4 | 4 |
| **Total** |  | **42** | **233** |

Le rig Riva est natif : tête, torse, bassin, deux bras, deux avant-bras, deux cuisses, deux tibias et deux bottes sont assemblés selon les joints du manifeste ; la traînée et le halo restent des effets séparés. Le renderer applique `rootOffsetY = -23.6` et le contrat mesure la limite alpha des bottes à `feetLocalY = 36`.

Le sol physique reste à `y = 620`. Les couches des six arènes historiques utilisent `visualOffsetY = 80` et les backdrops Forge `visualOffsetY = 28`. Ces corrections sont visuelles : les collisions et télégraphes conservent leurs coordonnées. Les backdrops Forge restent monocouches et ne sont pas documentés comme des décors parallaxe complets.

Les quatre images narratives sont des fichiers runtime dédiés et ne remplacent aucun texte accessible. Les masters ne sont jamais copiés dans le build.

## Contrats de maîtrise

| Machine | Temps Ingénieur ou Overdrive | Intégrité | Défi propre |
| --- | ---: | --- | --- |
| Rivet Rex | 44 s | Aucun dégât | Coup final avec la ruée dans le noyau ouvert. |
| Sky Slicer | 52 s | Aucun dégât | Activer la Surcharge pendant une ouverture du condensateur. |
| Magnetron | 58 s | Aucun dégât | Terminer un cycle complet de phase 3 sans subir éruption, débris ni onde. |
| Chrono Mantis | 54 s | Aucun dégât | Terminer un cycle complet de phase 3 sans être touchée par une ruée. |
| Foundry Titan | 66 s | Aucun dégât | Ne subir aucun impact direct de mine pendant la phase 3. |
| Crown Engine Ω | 82 s | Aucun dégât | Porter le coup final au noyau pendant une Surcharge. |

Les 72 contrats Forge possèdent une métrique instrumentée. Les signatures restent construites sur huit familles communes ; l’instrumentation complète ne signifie pas 72 sous-systèmes physiques indépendants. Une valeur inconnue échoue fermement.

## Chargement runtime et PWA

1. Key art, icône et titre ont la priorité.
2. Couches d’arène, pièces du boss courant, rig natif de Riva, VFX et image narrative active sont chargés progressivement.
3. `#art-loader`, `#art-loader-label` et `#art-loader-progress` exposent un retour accessible optionnel.
4. Une ressource validée peut entrer dans le cache PWA sous HTTP ou HTTPS.
5. En cas d’échec, le moteur bascule vers le rendu procédural.
6. Le chargement visuel ne bloque ni menu, ni sauvegarde, ni objectif critique.

Le runtime PWA traite `waiting` et `updatefound`. Il ne demande `SKIP_WAITING` qu’après activation du hook `#update-app`, puis protège `controllerchange` contre plusieurs rechargements. Le premier install reste silencieux.

## Surface de vérification présente

Le dépôt contient :

- des tests Node pour assets, contrats, histoires, release, serveur et service worker ;
- une configuration Playwright par défaut pour Chromium desktop et mobile tactile ;
- des projets Firefox desktop et WebKit desktop opt-in via `npm run test:e2e:cross-browser` ;
- un parcours E2E vérifiant menu, Forge, grille de 30 boss, débordement horizontal et diagnostics du rig de Riva ;
- une matrice E2E qui démarre les 24 boss Forge dans leurs trois phases ;
- un parcours E2E qui démarre le Circuit Forge et lit son premier checkpoint ;
- un contrat d’assets vérifiant le manifeste v2.9, les 233 fichiers, les catégories, les pivots du rig et le contact alpha déclaré ;
- un parcours E2E Chromium qui vérifie focus clavier, cibles de 44 CSS px, téléchargement JSON v5, import normalisé, préférences système first-run, Gamepad API simulée et rechargement hors ligne ;
- un workflow GitHub Actions Node 22.x qui prévoit QA, Chromium, E2E et audit de dépendances.

Ces fichiers sont une surface de vérification, pas une preuve de QA finale. Les E2E ne parcourent pas encore les six manches complètes d’ENDURANCE ENGINE, une campagne complète, une vraie manette, un lecteur d’écran ou un appareil mobile physique. Le cycle d’un worker réellement `waiting` jusqu’au consentement reste couvert par les contrats Node et non par Playwright. Firefox et WebKit sont configurés mais aucune exécution n’est revendiquée dans cette revue.

## Distribution et preuve

La cible reste une PWA à cache versionné, servie par HTTP ou HTTPS. Le lazy loading réduit le coût initial ; le fallback procédural maintient la jouabilité indépendamment du cache.

Ce document spécifie le comportement attendu et l’état statique observé. Il ne certifie ni QA finale, ni commit, ni push, ni déploiement. `QA_REPORT.md` reste réservé aux preuves réellement collectées.
