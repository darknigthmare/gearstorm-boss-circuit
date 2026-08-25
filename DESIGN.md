# GEARSTORM: Boss Circuit — conception v2.10.0

## Pitch

Le Professeur Cassian Voltério a transformé six infrastructures du Circuit en arènes de démonstration forcée. Riva Spark, technicienne de maintenance équipée de bottes cinétiques, remonte le réseau machine après machine. Le ton reste spectaculaire et théâtral, mais l’univers, les personnages, les silhouettes, les dialogues et les mécaniques sont originaux.

## Boucle de combat

1. Lire les télégraphes et survivre au pattern actif.
2. Identifier la fin de cycle et l’ouverture du noyau.
3. Tirer à distance ou risquer une ruée cinétique pour infliger davantage de dégâts.
4. Charger la Surcharge, puis l’activer pour ralentir les menaces et amplifier les dégâts.
5. Après une victoire de Circuit, choisir un module lorsque le parcours le prévoit.
6. Utiliser le résultat, les contrats et le Codex pour préparer la rencontre suivante.

Les trois difficultés modifient les marges de survie et de lecture sans changer l’ordre narratif. Les chronomètres, pénalités de retry, rangs et builds doivent rester déterministes après une reprise.

## Les six machines de campagne

1. **Rivet Rex** : bélier mono-roue, salves, mines, marteaux et impacts sismiques.
2. **Sky Slicer** : rapace bombardier, salves ioniques et grilles laser.
3. **Magnetron** : araignée magnétique, attraction/répulsion, ferraille et surgissements.
4. **Chrono Mantis** : mante temporelle, ruées, engrenages et lignes de temps.
5. **Foundry Titan** : colosse-fonderie, pistons, mines, métal en fusion et chutes de presse.
6. **Crown Engine Ω** : forteresse finale combinant l’arsenal des cinq machines précédentes.

Chaque boss franchit trois seuils de points de vie. Les phases augmentent la densité, modifient les timings et ajoutent des modules visuels ainsi que de nouvelles contre-attaques.

## Forge des trente machines

Depuis le titre, la Forge propose deux parcours distincts. La Forge libre expose les 30 machines pour des tentatives indépendantes ; le Circuit Forge enchaîne les boss 07 à 30 en quatre vagues de six. Aucun de ces parcours ne modifie `campaignCleared`, les six relais ou l’ordre narratif de la campagne.

Le Catalogue intégral est explicitement une simulation hors chronologie. Le Circuit Forge est une suite canonique qui ne s’ouvre qu’après l’abolition de la Couronne et prolonge la restitution des services sans modifier le destin de Cassian.

Chaque extension possède trois phases. Le registre attribue 24 `mechanicId` et 72 signatures d’état uniques, mais les rencontres reposent volontairement sur huit familles socles enrichies : renvoi, leurre, modules, mimétisme, voies/verticalité, gravité/météo, posture/duo et puzzle/endgame. La singularité vient des objectifs, paramètres, hazards, télégraphes et états propres, pas d’une duplication de 24 moteurs.

ENDURANCE ENGINE ajoute six manches internes. La progression de ses points de vie ne suffit pas : la phase 1 doit avoir atteint la manche 2, la phase 2 la manche 4 et la fin la manche 6. Cette barrière fait de la survie aux cycles la règle centrale du boss, même avec un build offensif puissant.

Le Circuit Forge sauvegarde en v5 le combat, le choix de module ou la fin à reprendre. Un module est proposé entre les boss ; la dernière victoire ouvre la restauration des quatre anneaux et enregistre le meilleur temps. `boss-roster.js` porte les règles de combat et `expansion-story.js` les objectifs, journaux, restaurations, 24 interludes, 24 `metaLine` et 72 contrats instrumentés. Le Codex conserve ces transmissions par anneau après déverrouillage.

## Progression et reprise v2.10

Onze modules couvrent cadence, noyau, ruée, tir multiple, dégâts, Surcharge, bouclier, mobilité, précision, combo et auto-réparation de phase. Ils ne persistent que pendant le Circuit en cours ; leurs limites de cumul empêchent de dépasser le niveau prévu.

La sauvegarde locale reste en schéma v5. Elle conserve déblocages, meilleurs temps, rangs, maîtrise et reprises séparées de campagne et de Forge. La v2.9 conserve les deux invariants de checkpoint introduits en v2.8 :

- `currentBossRetries` survit au rechargement, afin de préserver pénalités, score et rang ;
- `upgradeOffer` est figée au checkpoint `upgrade`, afin qu’une reprise retrouve exactement les trois choix déjà proposés.

L’export produit uniquement une copie JSON v5 normalisée de l’état courant. L’import est borné à 1 Mio et repasse exclusivement par la migration/normalisation avant toute persistance. Les options rendent les deux actions et un input fichier JSON masqué ; le pipeline runtime reste tolérant si un hook manque.


## Robustesse et causalité v2.10

La normalisation de sauvegarde réconcilie campagne terminée, boss débloqués et checkpoints finaux. Une v5 illisible peut retomber sur une v4 valide ; une migration déjà chargée reste jouable même si l’écriture v5 échoue par quota.

Le cache PWA écrit en best-effort : une réponse réseau valide est rendue même si `cache.put` échoue. Le cache raster conserve au plus trois bundles de boss selon un LRU et garde les assets permanents de Riva.

La lecture ne repose plus sur la couleur seule : voies numérotées et hachurées, formes et ordre textuel de LOGIC CRUCIBLE, réserve chiffrée d’ORBITAL FAMINE et flèches d’environnement. Cinq maîtrises Forge contextuelles utilisent leur événement causal exact.
Le Laboratoire et la Forge libre permettent de rejouer sans faire avancer les six relais ni les Circuits séquentiels.

## Accessibilité et lisibilité

Les dangers utilisent des télégraphes avant collision. Le jeu accepte clavier AZERTY/QWERTY, souris, manette et tactile. Les objectifs critiques ne disparaissent pas lorsque les conseils sont désactivés.

Sur une sauvegarde neuve seulement, le runtime initialise mouvement réduit et contraste renforcé depuis `prefers-reduced-motion` et `prefers-contrast`. Dès qu’une sauvegarde existe, ses réglages restent prioritaires. Le CSS décline ces modes sur les surfaces DOM et réduit les animations non essentielles ; leur efficacité sur les dangers Canvas doit toutefois être validée en situation.

Les cartes déverrouillées montrent une miniature WebP décorative du boss sans remplacer le texte ni l’état accessible. Les cartes verrouillées n’exposent pas cette illustration. Sur mobile portrait, le paysage est recommandé pour conserver la largeur tactique de l’arène.

## Direction artistique v2.10.0

Le manifeste v2.10.0, de schéma 3, référence 42 masters OpenAI et 233 WebP runtime pour 18 175 510 octets : 48 assets d’arène, 150 pièces de boss, 15 assets héroïne, 16 VFX et 4 images narratives. Il conserve dimensions, alpha, poids et SHA-256 ; les masters restent réservés à la provenance.

| Famille | Masters | Runtime |
| --- | ---: | ---: |
| Arènes campagne / Forge | 12 | 48 |
| Boss campagne / Forge | 10 | 150 |
| Riva Spark | 15 | 15 |
| VFX partagés | 1 | 16 |
| Narration | 4 | 4 |
| **Total** | **42** | **233** |

Riva utilise treize pièces anatomiques indépendantes et deux couches d’effet. L’asset proche `forearm-cannon-near` combine l’avant-bras et le canon ; aucun canon distinct n’est compté en plus. `rootOffsetY = -23.6` place les pixels utiles des bottes sur `feetLocalY = 36` ; `roadLift = 10`, `headDrop = 4` et la poussière à `y = 610` règlent la lecture de contact. Le recul vaut `12 px` local, soit `13,2 px` Canvas.

Le sol physique reste `y = 620`. Le rendu applique `+80 px` aux six décors de campagne et `+28 px` aux backdrops Forge pour aligner les routes peintes sans déplacer la simulation. Chaque boss Forge conserve quatre pièces transparentes et un backdrop ; ses animations secondaires restent pilotées par les huit familles moteur. Le fallback Canvas demeure disponible.

## Progression narrative

### Riva contre le système de Voltério

Riva Spark ne traverse pas une simple liste d’arènes. Ancienne technicienne du réseau, elle comprend comment chaque infrastructure a été détournée et choisit de la remettre au service des habitants. Ses améliorations restent des adaptations de terrain : elles renforcent son autonomie sans la transformer en arme de Voltério.

Cassian traite d’abord Riva comme une candidate imprévue, puis transforme ses corrections de trajectoire en données d’entraînement pour la Couronne. Riva découvre ce programme adaptatif à la Fosse, retrouve l’origine du détournement M-0 à l’Horloge et injecte une fausse surcharge dans la télémétrie de la Fournaise. La Couronne apprend ainsi la contre-phase qui permettra sa propre neutralisation.

### Les six actes du Circuit

| Acte | District | Fonction détournée | Battement narratif |
| ---: | --- | --- | --- |
| 01 | Rocade des Rivets | Transport, signalisation et convois | Riva ouvre la première voie ; Cassian identifie la technicienne de la ligne M-0. |
| 02 | Couloir des Hautes-Tensions | Inspection aérienne, énergie et communications | Le nord retrouve courant et canaux civils ; Cassian collecte les trajectoires de Riva. |
| 03 | Fosse Ferromagnétique | Fret, traction ferroviaire et évacuation | Les trains repartent ; Riva découvre le dossier adaptatif établi à son nom. |
| 04 | Horloge de la Faille | Synchronisation, horodatage et archives | Les preuves du verrouillage planifié sont répliquées ; l’inversion du protocole M-0 est révélée. |
| 05 | Fournaise des Pistons | Fabrication, réparation et alimentation industrielle | Riva injecte une contre-phase M-0 et coupe l’énergie externe de la Couronne. |
| 06 | Citadelle Voltério | Coordination et commandes de sécurité | La contre-phase neutralise le commandement exclusif sans condamner les infrastructures. |

Le Codex sépare connaissance et progression : une analyse de Laboratoire peut enrichir un dossier sans libérer artificiellement un district. Son volet Forge expose les quatre anneaux et conserve, pour chaque profil déverrouillé, l’interlude, la lecture hors cadre (`metaLine`) et le record associé.

## Parcours UX

- **Titre** : état du Circuit, prochain relais, reprise conditionnelle, Laboratoire, Forge, Codex, manuel et options.
- **Intro et prologue** : prise de contrôle de la Couronne, activation de M-0 et itinéraire des six relais.
- **Combat** : objectif permanent, nom de phase, communication brève et conseil contextuel facultatif.
- **Pause** : objectif, build, commandes et sorties explicites.
- **Résultat et interlude** : performance, journal de Riva, conséquence locale et décision suivante.
- **Atelier** : offre déterministe de trois modules parmi les onze disponibles.
- **Codex** : dossiers Riva/Voltério, six fiches civiles, neuf transmissions M-0 relisibles, panorama des quatre anneaux, quatre révélations, 24 journaux et 72 voix Forge.
- **Épilogues** : restauration des six relais pour la campagne et des quatre anneaux pour la Forge.

Les cartes de Forge conservent leur nom, leur état verrouillé/déverrouillé et leur libellé accessible même lorsque la miniature ne charge pas. Les options rendent les contrôles d’export/import ; le bouton de mise à jour PWA reste masqué jusqu’à la détection d’un worker en attente.

## Mise à jour PWA

Une première installation reste silencieuse. Pour une application déjà contrôlée, un worker en attente révèle l’action `#update-app`, initialement masquée. La joueuse déclenche alors explicitement `SKIP_WAITING`, puis le jeu recharge une seule fois lors de `controllerchange`.

## Contrats de maîtrise

`story.js` définit 18 contrats de campagne et `expansion-story.js` 72 contrats Forge, soit 90 objectifs. Les contrats Forge sont instrumentés : temps, dégâts, ouvertures, réponses de famille et événements propres au boss alimentent leurs métriques. Cette couverture réutilise les huit familles partagées et ne prétend pas que chaque compteur provient d’un sous-système indépendant. Une métrique absente reste non acquise.

## Fin

Après Crown Engine Ω, l’interlude de la Citadelle confirme la détention de Cassian, puis l’épilogue abolit le mandat de la Couronne et rend les six commandes locales aux équipes civiles. Riva publie M-0, détruit la clé maîtresse et la distribue entre six équipes qui ne peuvent agir qu’ensemble.

Le Circuit Forge possède sa propre fin : après NULL CROWN, les 24 services des quatre anneaux rendent leurs clés aux districts, sans ressusciter Cassian ni réécrire la campagne. Chaque écran final résume le temps et le build du parcours correspondant.
