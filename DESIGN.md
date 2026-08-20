# GEARSTORM: Boss Circuit — conception

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

## Progression

Onze modules couvrent la cadence, le noyau, la ruée, le tir multiple, les dégâts, la surcharge, le bouclier, la mobilité, la précision, le combo et l’auto-réparation de phase. Ils ne persistent que pendant le Circuit en cours ; leurs limites de cumul propres empêchent de dépasser le niveau prévu. Les boss débloqués, meilleurs temps et meilleurs rangs sont sauvegardés sur l’appareil. Le Laboratoire permet de rejouer chaque machine vaincue sans faire avancer les six relais de campagne.

## Accessibilité et lisibilité

Les dangers utilisent des télégraphes avant collision. Le mode mouvement réduit diminue les particules et transitions ; le contraste renforcé épaissit les repères. Le jeu accepte clavier AZERTY/QWERTY, souris, manette et tactile. L’indicateur de chargement artistique reste compact, annoncé par les technologies d’assistance et neutralise ses animations quand le mouvement réduit est demandé.

## Direction artistique v2.2

La direction privilégie des silhouettes mécaniques immédiatement reconnaissables, une matière industrielle peinte et des accents lumineux propres à chaque district. La lisibilité de l’action prime sur le détail décoratif.

### Décomposition des 14 masters

- Six atlases de décor 2 × 2 produisent chacun quatre couches : fond lointain opaque, plan médian, premier plan et atmosphère superposable. Total : 24 couches de parallaxe.
- Six atlases de boss 3 × 3 produisent chacun neuf pièces articulables sur fond réellement transparent. Total : 54 pièces.
- Un atlas Riva Spark 3 × 3 fournit neuf poses ou états cohérents à la même échelle.
- Un atlas VFX 4 × 4 fournit seize effets isolés, sans texte et sans décor résiduel.

Le total de production est de 14 masters OpenAI Image Generation intégré pour 103 assets indépendants. Les images sont originales, propres à GEARSTORM, sans logo, filigrane, texte incorporé ni reprise d’une franchise tierce.

### Règles d’intégration

- Les couches d’arène doivent conserver des zones de jeu lisibles et ne jamais masquer un télégraphe.
- Les pivots des neuf pièces de chaque boss doivent permettre l’animation sans saut de silhouette.
- Riva conserve proportions, palette et orientation entre ses neuf cellules.
- Les VFX doivent être isolables sans bord de cellule visible.
- Le key art et le titre sont prioritaires ; les assets de rencontre sont chargés à la demande.
- Le cache PWA peut conserver les ressources validées, tandis que le rendu procédural Canvas assure le fallback en cas d’échec.
- La progression de chargement peut être signalée au titre ou au prologue, sans bloquer l’accès aux commandes et avec respect du contraste élevé et du mouvement réduit.

## Progression narrative v2.4

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

## Parcours UX v2.4

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

`story.js` définit trois contrats par machine, soit dix-huit objectifs : temps de référence en difficulté Ingénieur ou Overdrive, combat sans dégâts et défi propre au pattern ou au coup final. Leur définition narrative et leurs identifiants sont stables ; un contrat n’est considéré acquis que lorsque le runtime enregistre sa condition dans la sauvegarde locale. Les défis de Magnetron et Chrono Mantis exigent un cycle complet de phase 3 sans l’impact interdit ; celui de Foundry Titan interdit un impact direct de mine, pas son déclenchement automatique.

## Fin

Après Crown Engine Ω, l’interlude de la Citadelle confirme la détention de Cassian, puis l’épilogue rend les six commandes locales aux équipes civiles. Riva refuse la Couronne au profit de six interrupteurs, six équipes et d’une ligne M-0 indépendante. L’écran final peut résumer le temps, le score, les tentatives et les modules installés avant le Laboratoire ou le menu principal.
