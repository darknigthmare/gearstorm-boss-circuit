# GEARSTORM: Boss Circuit — conception v2.7

## Pitch

Le Professeur Cassian Voltério a transformé six infrastructures du Circuit en arènes de démonstration forcée. Riva Spark, pilote de maintenance équipée de bottes cinétiques, remonte le réseau machine après machine. Le ton reste spectaculaire et théâtral, mais l’univers, les personnages, les silhouettes, les dialogues et les mécaniques sont originaux.

## Boucle de combat

1. Lire les télégraphes et survivre au pattern actif.
2. Identifier la fin de cycle et l’ouverture du noyau.
3. Tirer à distance ou risquer une ruée cinétique pour infliger davantage de dégâts.
4. Charger la surcharge, puis l’activer pour ralentir les menaces et amplifier les dégâts.
5. Après une victoire de campagne, installer un module avant le boss suivant.

## Les six machines

1. **Rivet Rex** : bélier mono-roue, salves, mines, marteaux et impacts sismiques.
2. **Sky Slicer** : rapace bombardier, salves ioniques et grilles laser.
3. **Magnetron** : araignée magnétique, attraction/répulsion, ferraille et surgissements.
4. **Chrono Mantis** : mante temporelle, ruées, engrenages et lignes de temps.
5. **Foundry Titan** : colosse-fonderie, pistons, mines, métal en fusion et chutes de presse.
6. **Crown Engine Ω** : forteresse finale combinant l’arsenal des cinq machines précédentes.

Chaque boss franchit trois seuils de points de vie. Les phases augmentent la densité, modifient les timings et ajoutent des modules visuels ainsi que de nouvelles contre-attaques.

## Forge des trente machines

Depuis le titre, la Forge propose deux parcours distincts. La Forge libre expose les trente machines pour des tentatives indépendantes ; le Circuit Forge enchaîne uniquement les boss 07 à 30 en quatre vagues de six. Aucun de ces parcours ne modifie `campaignCleared`, les six relais ou l’ordre narratif de la campagne.

Chaque extension possède trois phases. Le registre attribue vingt-quatre `mechanicId` et soixante-douze signatures d’état uniques, mais les rencontres reposent volontairement sur huit familles socles enrichies : renvoi, leurre, modules, mimétisme, voies/verticalité, gravité/météo, posture/duo et puzzle/endgame. La singularité vient des objectifs, paramètres, hazards, télégraphes et états propres, pas d’une duplication de vingt-quatre moteurs.

Le Circuit Forge sauvegarde en v5 le combat, le choix de module ou la fin à reprendre. Un module est proposé entre les boss ; la dernière victoire ouvre la restauration des quatre anneaux et enregistre le meilleur temps. `boss-roster.js` porte les règles de combat et `expansion-story.js` les objectifs, journaux, restaurations et 72 contrats instrumentés.

## Progression

Onze modules couvrent la cadence, le noyau, la ruée, le tir multiple, les dégâts, la surcharge, le bouclier, la mobilité, la précision, le combo et l’auto-réparation de phase. Ils ne persistent que pendant le Circuit en cours ; leurs limites de cumul propres empêchent de dépasser le niveau prévu. La sauvegarde locale v5 conserve déblocages, meilleurs temps, rangs, maîtrise et reprises séparées de campagne et de Forge. Le Laboratoire et la Forge libre permettent de rejouer sans faire avancer les six relais ni le Circuit Forge.

## Accessibilité et lisibilité

Les dangers utilisent des télégraphes avant collision. Le mode mouvement réduit diminue les particules et transitions ; le contraste renforcé épaissit les repères. Le jeu accepte clavier AZERTY/QWERTY, souris, manette et tactile. L’indicateur de chargement artistique reste compact, annoncé par les technologies d’assistance et neutralise ses animations quand le mouvement réduit est demandé.

## Direction artistique v2.7

La direction privilégie une silhouette lisible, une matière industrielle peinte et des accents lumineux propres à chaque machine. Les vingt-six masters OpenAI retenus produisent 225 WebP runtime : 24 couches de décor de campagne, 54 pièces pour les six boss de campagne, 24 backdrops Forge, 96 pièces Forge, 11 pièces de Riva et 16 VFX. Le manifeste 2.7.0 conserve dimensions, alpha, poids et SHA-256 ; les masters servent uniquement à la provenance.

Riva utilise un corps v4 cohérent et un seul bras-canon indépendant. Le pivot de semelles tombe exactement sur le plancher logique, le torse n’est composé qu’une fois et l’ombre est une petite ellipse de contact. Chaque boss Forge possède un backdrop et quatre pièces transparentes ; leurs animations secondaires restent pilotées par les huit familles moteur. Le moteur conserve ses fallbacks si une ressource ne charge pas.

## Progression narrative

### Riva contre le système de Voltério

Riva Spark ne traverse pas une simple liste d’arènes. Ancienne technicienne du réseau, elle comprend comment chaque infrastructure a été détournée et choisit de la remettre au service des habitants. Ses améliorations restent des adaptations de terrain : elles renforcent son autonomie sans la transformer en arme de Voltério.

Cassian Voltério traite d’abord Riva comme une candidate imprévue, puis transforme ses corrections de trajectoire en données d’entraînement pour la Couronne. Riva découvre ce programme adaptatif à la Fosse, retrouve l’origine du détournement M-0 à l’Horloge et injecte une fausse surcharge dans la télémétrie de la Fournaise. La Couronne apprend ainsi la contre-phase qui permettra sa propre neutralisation.

### Les six actes du Circuit

| Acte | District | Fonction détournée | Battement narratif |
| ---: | --- | --- | --- |
| 01 | Rocade des Rivets | Transport, signalisation et convois | Riva ouvre la première voie ; Cassian identifie la technicienne de la ligne M-0. |
| 02 | Couloir des Hautes-Tensions | Inspection aérienne, énergie et communications | Le nord retrouve son courant de secours et ses canaux civils ; Cassian collecte les trajectoires de Riva. |
| 03 | Fosse Ferromagnétique | Fret, traction ferroviaire et évacuation | Les trains repartent ; Riva découvre le dossier adaptatif établi à son nom. |
| 04 | Horloge de la Faille | Synchronisation, horodatage et archives | Les preuves du verrouillage planifié sont répliquées ; l’inversion du protocole M-0 est révélée. |
| 05 | Fournaise des Pistons | Fabrication, réparation et alimentation industrielle | Riva injecte une contre-phase M-0 dans la télémétrie et coupe l’énergie externe de la Couronne. |
| 06 | Citadelle Voltério | Coordination et commandes de sécurité | La contre-phase neutralise le commandement exclusif sans condamner les infrastructures. |

Le registre Codex décrit pour chaque machine son origine civile, son détournement, la lecture mécanique du combat et l’impact de sa neutralisation. Les entrées se débloquent séparément de l’avancement des relais : une analyse de Laboratoire peut enrichir le Codex sans libérer artificiellement un district de campagne.

## Parcours UX

- **Titre** : état du Circuit, prochain relais, reprise conditionnelle et accès direct au Codex.
- **Intro** : prise de contrôle de la Couronne et interruption des six services civils.
- **Prologue** : activation de la ligne M-0, objectif global et itinéraire des six relais ; titre, résumé, dialogues, objectif et méthode proviennent de `story.js`, tandis que la route est dérivée de ses six actes.
- **Intro boss** : fonction civile, silhouette et provocation de Cassian dans une plaque compacte hors de l’action centrale.
- **Combat** : objectif permanent, noms de phase, communications brèves et conseil contextuel désactivable.
- **Pause** : objectif, build, commandes et trois sorties sans ambiguïté.
- **Résultat** : performance, journal de Riva, conséquence locale et build avant la transmission.
- **Interlude** : réponse des canaux civils, progression du plan de Cassian et décision suivante de Riva.
- **Atelier** : choix d’un module parmi les onze disponibles, replacé dans l’itinéraire de campagne.
- **Codex** : dossiers Riva/Voltério, six fiches civiles et archive des transmissions M-0.
- **Épilogue** : six relais restaurés, Cassian détenu, commandes distribuées, bilan de temps, score, tentatives et build final.

Les objectifs et conseils sont séparés : désactiver `#hints-toggle` masque `#combat-hint`, jamais `#combat-objective`. Les écrans utilisent les mêmes conventions de retour, focus et titres que les menus historiques. Les nouvelles régions restent compactes sur mobile, respectent les zones sûres et conservent un fond opaque sur les effets de fumée.

## Contrats de maîtrise

`story.js` définit dix-huit contrats de campagne et `expansion-story.js` soixante-douze contrats Forge, soit quatre-vingt-dix objectifs. Les 72/72 contrats Forge sont instrumentés : temps, dégâts, ouvertures, réponses de famille et événements propres au boss alimentent leurs métriques. Cette couverture réutilise les huit familles socles enrichies ; elle ne prétend pas que chaque compteur provient d’un sous-système entièrement indépendant. Une métrique absente reste non acquise et aucun contrat n’est sauvegardé sans évaluation réelle. Les défis historiques de Magnetron, Chrono Mantis et Foundry Titan conservent leurs interdictions précises de phase 3.

## Fin

Après Crown Engine Ω, l’interlude de la Citadelle confirme la détention de Cassian, puis l’épilogue rend les six commandes locales aux équipes civiles. Riva refuse la Couronne au profit de six interrupteurs, six équipes et d’une ligne M-0 indépendante. Le Circuit Forge possède sa propre fin : après NULL CROWN, les vingt-quatre services des quatre anneaux rendent leurs clés aux districts, sans ressusciter Cassian ni réécrire la campagne. Chaque écran final résume le temps et le build du parcours correspondant.
