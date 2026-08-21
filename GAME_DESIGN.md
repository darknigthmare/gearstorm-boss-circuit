# GEARSTORM: Boss Circuit — conception 2.7

`DESIGN.md` reste la source de vérité des règles et `story.js` celle des scènes, actes, transmissions, dossiers Codex et contrats de maîtrise. `expansion-story.js` et `boss-roster.js` étendent ce contrat à la Forge. Ce document fixe leur intégration de production, de narration interactive et d’UX pour la version 2.7.

## Invariants de jeu

- La campagne conserve six boss et trois phases par boss ; un module est choisi après chacune des cinq premières victoires.
- Les télégraphes restent lisibles avant toute collision dangereuse.
- Une illustration ou un texte d’aide ne modifie jamais les hitboxes, les timings, les seuils de phase ou la logique de sauvegarde.
- Chaque silhouette reste identifiable en mouvement, en contraste standard comme renforcé.
- Clavier, souris, tactile et manette conservent la même priorité fonctionnelle.
- Le rendu procédural reste une voie valide et jouable, pas un écran d’erreur.
- L’objectif critique demeure visible même lorsque les conseils contextuels sont désactivés.
- Une victoire de Laboratoire peut enrichir le Codex, mais ne libère jamais un relais de campagne.

## Extension Forge v2.7

- Le roster total contient exactement trente identifiants stables et quatre-vingt-dix phases.
- Les vingt-quatre extensions sont jouables en sélection libre et dans le Circuit Forge 07–30 ; elles ne libèrent aucun district de campagne.
- Le Circuit Forge comporte quatre vagues de six, des améliorations entre les boss, une reprise v5 et une fin dédiée.
- Vingt-quatre `mechanicId` et soixante-douze signatures d’état uniques spécialisent huit familles mécaniques communes ; cette mutualisation reste explicite.
- Chaque profil charge quatre pièces et un backdrop v2.7 à la demande, avec fallback procédural.
- Les 72/72 contrats de maîtrise Forge sont instrumentés ; une mesure inconnue ne vaut jamais réussite.
- Le corps de Riva touche le plancher logique par son pivot de semelles, son torse n’est rendu qu’une fois et l’ombre sert uniquement de contact.

## Progression narrative des six districts

Voltério a relié les six infrastructures civiles à autant de relais de sécurité, puis centralisé leurs commandes dans la Couronne. Chaque machine verrouille un district et l’accès physique au suivant. Les victoires de Riva sont donc à la fois mécaniques et civiles.

| Étape | District | Machine | Enjeu | Conséquence de la victoire |
| ---: | --- | --- | --- | --- |
| 01 | Rocade des Rivets | Rivet Rex | Transport, signalisation et convois verrouillés | La Rocade redevient une voie publique ; Cassian identifie Riva et la ligne M-0. |
| 02 | Couloir des Hautes-Tensions | Sky Slicer | Énergie de secours et communications brouillées | Le courant et les canaux civils du nord reviennent ; la collecte adaptative devient visible. |
| 03 | Fosse Ferromagnétique | Magnetron | Fret, rails et évacuations immobilisés | Les trains repartent ; Riva découvre son dossier d’entraînement dans la Couronne. |
| 04 | Horloge de la Faille | Chrono Mantis | Horodatages et archives publiques falsifiés | Les archives distribuées prouvent le verrouillage planifié et l’inversion de M-0. |
| 05 | Fournaise des Pistons | Foundry Titan | Production et alimentation industrielle coercitives | La reconstruction remplace l’armement ; la contre-phase de Riva remonte vers la Citadelle. |
| 06 | Citadelle Voltério | Crown Engine Ω | Coordination et commandes de sécurité centralisées | La Couronne perd son exclusivité ; chaque district récupère ses contrôles locaux. |

Riva Spark reste la technicienne de maintenance qui a conçu la ligne manuelle M-0. Elle gagne grâce à sa connaissance du réseau, sa lecture des cycles et l’adaptation de son équipement. Cassian Voltério, ancien architecte du réseau devenu maître de cérémonie autoritaire, transforme ses échecs en données pour une Couronne adaptative. Riva finit par lui fournir volontairement une fausse solution : la contre-phase M-0 qui neutralise son commandement sans arrêter les services.

## Parcours d’un jeu complet

1. Le titre expose l’état de campagne, le prochain relais et les entrées Circuit, reprise, Laboratoire, Forge, Codex, manuel et options.
2. L’intro montre la prise de contrôle de la Couronne et l’interruption des six services civils.
3. Le prologue active la ligne M-0, fixe l’objectif des six relais et présente l’itinéraire.
4. L’intro de machine présente sa fonction civile, le district, la silhouette et les voix de Cassian et Riva.
5. Le combat maintient un objectif bref, nomme chaque phase et ajoute, si autorisé, un conseil contextuel.
6. La pause rappelle objectif, build et commandes sans faire perdre le contexte.
7. Le résultat relie performance, build, journal de Riva et conséquence locale.
8. L’interlude confirme la restauration, fait progresser l’enquête sur la Couronne et ouvre l’étape suivante.
9. Après les cinq premiers boss, l’Atelier propose un module parmi les onze disponibles avant le relais suivant.
10. Après Crown Engine Ω, l’interlude final mène à l’épilogue : Cassian est détenu et les six commandes sont distribuées aux équipes civiles.
11. Le Codex et les archives M-0 conservent les informations réellement découvertes.

Le Circuit Forge constitue un second parcours complet : sélection de FORGE 07, six combats par vague, choix de module entre les boss, sauvegarde après chaque victoire, reprise au combat ou à l’Atelier, puis écran final après FORGE 30. La Forge libre demeure une surface d’entraînement indépendante.

## Contrat des hooks UX

Tous les IDs historiques sont conservés. Les hooks v2.7 complètent les écrans sans modifier leur sémantique par CSS.

| Hook | État initial | Comportement requis |
| --- | --- | --- |
| `#story-screen`, `#story-dialogue` | Écran fermé | Afficher l’intro ou l’interlude demandé depuis `story.js`, avec chapitre, lieu, résumé, lignes attribuées et conséquence. |
| `#prologue-kicker`, `#prologue-chapter`, `#prologue-title`, `#prologue-summary`, `#prologue-dialogue`, `#prologue-objective`, `#prologue-method` | Repli HTML cohérent | Hydrater le prologue depuis `STORY.prologue` ; le HTML ne sert que de repli sans JavaScript. |
| `#prologue-route` | Six étapes de repli | Reconstruire l’itinéraire depuis `STORY.acts`, dans l’ordre de `STORY.bossOrder`. |
| `#story-continue`, `#story-back` | Actions visibles | Avancer vers le prologue, le combat, l’Atelier ou l’épilogue ; permettre un retour explicite au menu. |
| `#continue-run` | `hidden` | N’apparaître qu’avec une reprise valide, préciser sa destination et restaurer le bon checkpoint : combat, interlude ou Atelier. |
| `#campaign-progress`, `#campaign-next` | Texte de nouveau jeu | Refléter les districts libérés, la prochaine cible et la complétion. |
| `#codex`, `#codex-screen` | Écran fermé | Ouvrir/fermer via le gestionnaire d’écrans et restituer le focus. |
| `#codex-grid`, `#codex-progress` | Aucun dossier de victoire | Synchroniser attribut `data-state`, libellé d’état, origine civile, détournement, lecture et impact sauvegardés. |
| `#story-archive`, `#story-archive-progress` | Archives chiffrées | Lister l’intro, les six interludes et l’épilogue réellement découverts. |
| `#combat-objective` | Briefing masqué hors combat | Décrire l’action nécessaire pour le boss ou la phase en cours. |
| `#radio-comms`, `#radio-speaker`, `#radio-line` | Transmission masquée | Exposer une communication de transformation temporaire sans recouvrir le HUD ni la silhouette du boss. |
| `#combat-hint` | Conseil générique | Présenter une seule instruction courte lors d’une nouvelle mécanique, jamais à chaque frame. |
| `#hints-toggle` | Activé | Persister le choix et masquer uniquement les conseils, pas l’objectif. |
| `#pause-objective`, `#pause-build` | Valeurs de repli | Reprendre le contexte du combat et `describeBuild()`. |
| `#result-lore`, `#result-build` | Valeurs de repli | Afficher le journal de Riva, la restauration du district et le build après victoire. |
| `#result-mastery` | Conteneur vide | N’afficher comme acquis que les contrats dont la condition a été évaluée et sauvegardée par le runtime. |
| `#forge-rush-start`, `#continue-forge` | Nouvelle tentative / reprise masquée | Lancer FORGE 07 ou restaurer le checkpoint v5 sans toucher à la reprise de campagne. |
| `#forge-run-summary`, `#forge-wave-progress` | 24 machines, vague 1 | Exposer la vague, le nombre de victoires, le build et la prochaine étape avec un état textuel. |
| `#forge-ending-screen` | Écran fermé | Résumer la restauration des quatre anneaux, le temps total et le build après FORGE 30. |

Les hooks complémentaires `#continue-run-detail`, `#lab-progress`, `#upgrade-progress`, `#upgrade-build`, `#story-archive-progress` et `#gameover-hint` complètent le texte visible mais ne remplacent aucun état moteur.

## Contrat de sauvegarde narrative

La sauvegarde locale v5 migre les données v4 sans effacer la campagne. Elle sépare explicitement les deux Circuits :

- `campaignCleared` contient uniquement les machines neutralisées dans un Circuit de campagne ;
- `storySeen` mémorise l’intro, le prologue, les interludes et l’épilogue effectivement traversés ;
- `codexUnlocked` reste indépendant : le Laboratoire peut documenter une machine sans libérer son relais ;
- `mastery` associe à chaque machine uniquement les identifiants de contrats réellement validés ;
- `rushSnapshot.checkpoint` distingue `fight`, `interlude` et `upgrade` pour la campagne ;
- `forgeCleared`, `forgeCompleted` et `bestForgeRush` portent l’historique Forge sans avancer les six relais ;
- `forgeRushSnapshot` conserve le boss 07–30 courant, `fight`, `upgrade` ou `ending`, le temps, les pénalités, le score, les tentatives, la difficulté et les modules installés.

La sauvegarde reste locale au navigateur : aucune synchronisation cloud ou interappareil n’est revendiquée.

## Onboarding et accessibilité

- L’intro et le prologue expliquent le but du Circuit avant le premier combat ; leurs actions Continuer et Retour restent explicites et accessibles.
- Les conseils apparaissent à des moments significatifs, restent courts et peuvent être désactivés.
- L’objectif actif, les changements de phase et les résultats utilisent des annonces polies et atomiques ; les valeurs animées image par image ne sont pas annoncées.
- Le Codex conserve une hiérarchie de titres et des états textuels « accessible » ou « chiffré », sans dépendre de la couleur seule.
- La pause est un dialogue modal et restitue un chemin clair vers reprise, nouvelle tentative ou menu.
- Les plaques de briefing et de transmission évitent le HUD, les commandes tactiles et les silhouettes ; elles utilisent un fond suffisamment opaque sur fumée ou orange lumineux.
- Le contraste renforcé et `prefers-contrast` durcissent les bordures et les fonds ; le mouvement réduit neutralise les animations non essentielles.
- Les petits écrans réorganisent le Codex, les récapitulatifs et les commandes en une colonne sans réduire les cibles sous 44 × 44 CSS px.

## Contrat artistique v2.7

Vingt-six masters originaux produits avec OpenAI Image Generation intégré alimentent 225 assets runtime indépendants dans le manifeste 2.7.0.

| Famille | Contrat de production | Masters | Assets runtime |
| --- | --- | ---: | ---: |
| Arènes de campagne | quatre couches de parallaxe | 6 | 24 |
| Boss de campagne | neuf pièces articulables | 6 | 54 |
| Boss Forge 07–30 | quatre planches 3 × 2 segmentées en quatre pièces par machine | 4 | 96 |
| Arènes Forge 07–30 | six planches, un backdrop par machine | 6 | 24 |
| Riva Spark | atlas historique, corps cohérent v4 et bras-canon v4 | 3 | 11 |
| VFX | seize effets isolés | 1 | 16 |
| **Total** |  | **26** | **225** |

Les exports sont cadrés, détourés et hachés par le pipeline reproductible. Le rig Riva de production compose une seule fois le corps v4, pose ses semelles sur le plancher logique et raccorde uniquement le bras-canon v4 au socket d’épaule. Chaque machine Forge dispose de quatre pièces et d’un backdrop, mais conserve une animation secondaire pilotée par famille et un fallback procédural ; le backdrop n’est pas un décor parallaxe à quatre couches.

## Contrats de maîtrise

| Machine | Temps Ingénieur ou Overdrive | Intégrité | Défi propre |
| --- | ---: | --- | --- |
| Rivet Rex | 44 s | Aucun dégât | Coup final avec la ruée dans le noyau ouvert. |
| Sky Slicer | 52 s | Aucun dégât | Activer la surcharge pendant une ouverture du condensateur. |
| Magnetron | 58 s | Aucun dégât | Terminer un cycle complet de phase 3 sans subir l’éruption, ses débris ni son onde de choc. |
| Chrono Mantis | 54 s | Aucun dégât | Terminer un cycle complet de phase 3 sans être touchée par une ruée. |
| Foundry Titan | 66 s | Aucun dégât | Ne subir aucun impact direct de mine pendant la phase 3. |
| Crown Engine Ω | 82 s | Aucun dégât | Porter le coup final au noyau pendant une surcharge. |

`story.js` définit dix-huit contrats de campagne et `expansion-story.js` soixante-douze contrats Forge, soit quatre-vingt-dix objectifs. Les 72/72 contrats Forge possèdent une métrique instrumentée : les compteurs de temps, dégâts, ouvertures, finish, erreurs et interactions de famille proviennent de la télémétrie de la tentative. Les signatures restent construites sur huit familles socles enrichies ; l’instrumentation complète ne signifie donc pas soixante-douze sous-systèmes physiques indépendants. Une valeur inconnue échoue fermement et n’est jamais convertie en réussite. Les défis de Magnetron, Chrono Mantis et Foundry Titan conservent leurs conditions historiques précises.

## Chargement runtime et PWA

1. Le key art, l’icône et l’interface de titre ont la priorité.
2. Les couches d’arène, les pièces du boss courant, les poses utiles de Riva et les VFX requis sont demandés progressivement.
3. `#art-loader`, `#art-loader-label` et `#art-loader-progress` exposent un retour accessible optionnel.
4. Une ressource validée peut entrer dans le cache PWA quand le jeu est servi en HTTP ou HTTPS.
5. En cas d’absence, délai, erreur réseau ou échec de décodage, le moteur bascule vers le rendu procédural.
6. Le chargement visuel ne bloque ni une commande de menu, ni une sauvegarde, ni un objectif critique.

## Distribution et preuve

La cible reste une PWA à cache versionné, servie par HTTP ou HTTPS. Le lazy loading réduit le coût initial ; le fallback procédural maintient la jouabilité indépendamment du cache.

Ce document spécifie le comportement attendu. Il ne certifie ni QA ni déploiement. `QA_REPORT.md` ne doit être modifié qu’après collecte de preuves pour les tests moteur, navigateur, responsive, accessibilité, PWA et publication.
