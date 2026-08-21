# GEARSTORM: Boss Circuit — conception v2.8.0

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

Chaque extension possède trois phases. Le registre attribue 24 `mechanicId` et 72 signatures d’état uniques, mais les rencontres reposent volontairement sur huit familles socles enrichies : renvoi, leurre, modules, mimétisme, voies/verticalité, gravité/météo, posture/duo et puzzle/endgame. La singularité vient des objectifs, paramètres, hazards, télégraphes et états propres, pas d’une duplication de 24 moteurs.

ENDURANCE ENGINE ajoute six manches internes. La progression de ses points de vie ne suffit pas : la phase 1 doit avoir atteint la manche 2, la phase 2 la manche 4 et la fin la manche 6. Cette barrière fait de la survie aux cycles la règle centrale du boss, même avec un build offensif puissant.

Le Circuit Forge sauvegarde en v5 le combat, le choix de module ou la fin à reprendre. Un module est proposé entre les boss ; la dernière victoire ouvre la restauration des quatre anneaux et enregistre le meilleur temps. `boss-roster.js` porte les règles de combat et `expansion-story.js` les objectifs, journaux, restaurations et 72 contrats instrumentés.

## Progression et reprise v2.8

Onze modules couvrent cadence, noyau, ruée, tir multiple, dégâts, Surcharge, bouclier, mobilité, précision, combo et auto-réparation de phase. Ils ne persistent que pendant le Circuit en cours ; leurs limites de cumul empêchent de dépasser le niveau prévu.

La sauvegarde locale reste en schéma v5. Elle conserve déblocages, meilleurs temps, rangs, maîtrise et reprises séparées de campagne et de Forge. La v2.8 complète les checkpoints avec deux invariants :

- `currentBossRetries` survit au rechargement, afin de préserver pénalités, score et rang ;
- `upgradeOffer` est figée au checkpoint `upgrade`, afin qu’une reprise retrouve exactement les trois choix déjà proposés.

L’export produit uniquement une copie JSON v5 normalisée de l’état courant. L’import est borné à 1 Mio et repasse exclusivement par la migration/normalisation avant toute persistance. Les options rendent les deux actions et un input fichier JSON masqué ; le pipeline runtime reste tolérant si un hook manque.

Le Laboratoire et la Forge libre permettent de rejouer sans faire avancer les six relais ni les Circuits séquentiels.

## Accessibilité et lisibilité

Les dangers utilisent des télégraphes avant collision. Le jeu accepte clavier AZERTY/QWERTY, souris, manette et tactile. Les objectifs critiques ne disparaissent pas lorsque les conseils sont désactivés.

Sur une sauvegarde neuve seulement, le runtime initialise mouvement réduit et contraste renforcé depuis `prefers-reduced-motion` et `prefers-contrast`. Dès qu’une sauvegarde existe, ses réglages restent prioritaires. Le CSS décline ces modes sur les surfaces DOM et réduit les animations non essentielles ; leur efficacité sur les dangers Canvas doit toutefois être validée en situation.

Les cartes déverrouillées montrent une miniature WebP décorative du boss sans remplacer le texte ni l’état accessible. Les cartes verrouillées n’exposent pas cette illustration. Sur mobile portrait, le paysage est recommandé pour conserver la largeur tactique de l’arène.

## Direction artistique v2.7.0

La version applicative est v2.8.0, mais la production visuelle reste le lot immuable v2.7.0. Les 26 masters OpenAI retenus produisent 225 WebP runtime : 24 couches de décor de campagne, 54 pièces pour les six boss historiques, 24 backdrops Forge, 96 pièces Forge, 11 pièces de Riva et 16 VFX. Le manifeste 2.7.0 conserve dimensions, alpha, poids et SHA-256 ; les masters servent uniquement à la provenance.

Riva utilise un corps v4 cohérent et un seul bras-canon indépendant. Le pivot de semelles tombe sur le plancher logique, le torse n’est composé qu’une fois et l’ombre est une petite ellipse de contact. Chaque boss Forge possède un backdrop et quatre pièces transparentes ; leurs animations secondaires restent pilotées par les huit familles moteur. Le moteur conserve ses fallbacks si une ressource ne charge pas.

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

Le Codex sépare connaissance et progression : une analyse de Laboratoire peut enrichir un dossier sans libérer artificiellement un district.

## Parcours UX

- **Titre** : état du Circuit, prochain relais, reprise conditionnelle, Laboratoire, Forge, Codex, manuel et options.
- **Intro et prologue** : prise de contrôle de la Couronne, activation de M-0 et itinéraire des six relais.
- **Combat** : objectif permanent, nom de phase, communication brève et conseil contextuel facultatif.
- **Pause** : objectif, build, commandes et sorties explicites.
- **Résultat et interlude** : performance, journal de Riva, conséquence locale et décision suivante.
- **Atelier** : offre déterministe de trois modules parmi les onze disponibles.
- **Codex** : dossiers Riva/Voltério, six fiches civiles et archives M-0.
- **Épilogues** : restauration des six relais pour la campagne et des quatre anneaux pour la Forge.

Les cartes de Forge conservent leur nom, leur état verrouillé/déverrouillé et leur libellé accessible même lorsque la miniature ne charge pas. Les options rendent les contrôles d’export/import ; le bouton de mise à jour PWA reste masqué jusqu’à la détection d’un worker en attente.

## Mise à jour PWA

Une première installation reste silencieuse. Pour une application déjà contrôlée, un worker en attente révèle l’action `#update-app`, initialement masquée. La joueuse déclenche alors explicitement `SKIP_WAITING`, puis le jeu recharge une seule fois lors de `controllerchange`.

## Contrats de maîtrise

`story.js` définit 18 contrats de campagne et `expansion-story.js` 72 contrats Forge, soit 90 objectifs. Les contrats Forge sont instrumentés : temps, dégâts, ouvertures, réponses de famille et événements propres au boss alimentent leurs métriques. Cette couverture réutilise les huit familles partagées et ne prétend pas que chaque compteur provient d’un sous-système indépendant. Une métrique absente reste non acquise.

## Fin

Après Crown Engine Ω, l’interlude de la Citadelle confirme la détention de Cassian, puis l’épilogue rend les six commandes locales aux équipes civiles. Riva refuse la Couronne au profit de six interrupteurs, six équipes et d’une ligne M-0 indépendante.

Le Circuit Forge possède sa propre fin : après NULL CROWN, les 24 services des quatre anneaux rendent leurs clés aux districts, sans ressusciter Cassian ni réécrire la campagne. Chaque écran final résume le temps et le build du parcours correspondant.
