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
2. **Sky Slicer** : rapace bombardier, éventails ioniques et grilles laser.
3. **Magnetron** : araignée magnétique, attraction/répulsion, ferraille et surgissements.
4. **Chrono Mantis** : mante temporelle, ruées, engrenages et lignes de temps.
5. **Foundry Titan** : colosse-fonderie, pistons, bombes, lave et chutes lourdes.
6. **Crown Engine Ω** : forteresse finale combinant l’arsenal des cinq machines précédentes.

Chaque boss franchit trois seuils de points de vie. Les phases augmentent la densité, modifient les timings et ajoutent des modules visuels ainsi que de nouvelles contre-attaques.

## Progression

Les six améliorations couvrent la cadence, la résistance, la ruée, le tir multiple, les dégâts et la surcharge. Elles ne persistent que pendant le Circuit en cours ; les boss débloqués et meilleurs temps sont sauvegardés sur l’appareil. Le Laboratoire permet de rejouer chaque machine vaincue sans fausser la campagne.

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

## Progression narrative v2.3

### Riva contre le système de Voltério

Riva Spark ne traverse pas une simple liste d’arènes. Ancienne technicienne du réseau, elle comprend comment chaque infrastructure a été détournée et choisit de la remettre au service des habitants. Ses améliorations restent des adaptations de terrain : elles renforcent son autonomie sans la transformer en arme de Voltério.

Cassian Voltério traite d’abord Riva comme une variable divertissante, puis comme une anomalie qu’il doit intégrer à son récit. Après chaque machine, sa maîtrise de la diffusion, de l’énergie ou des déplacements diminue. La progression doit faire sentir cette perte de contrôle avant même la Citadelle.

### Les six actes du Circuit

| Acte | District | Fonction détournée | Battement narratif |
| ---: | --- | --- | --- |
| 01 | Rocade des Rivets | Transport et couvre-feu | Riva ouvre la première voie et force Voltério à reconnaître son intervention. |
| 02 | Couloir des Hautes-Tensions | Communications du nord | Sa voix franchit le brouillage et les habitants comprennent que le Circuit peut tomber. |
| 03 | Fosse Ferromagnétique | Rails d’évacuation | Les spectateurs captifs disposent enfin d’une sortie réelle. |
| 04 | Horloge de la Faille | Horloges, archives et classement | Voltério ne peut plus réécrire le temps de la révolte. |
| 05 | Fournaise des Pistons | Énergie et production | Le spectacle perd son alimentation et la Citadelle devient vulnérable. |
| 06 | Citadelle Voltério | Commandement de la chaîne | Riva retourne contre la Couronne les cinq technologies déjà apprises. |

Le Codex dévoile ces conséquences au rythme de la sauvegarde. Il montre d’abord la silhouette, l’arène et le danger principal ; la victoire complète ensuite la lecture de la machine et son effet sur le district. Le joueur peut ainsi relire le récit sans subir une exposition pendant l’action.

## Parcours UX v2.3

- **Titre** : état du Circuit, prochaine cible, reprise conditionnelle et accès direct au Codex.
- **Prologue** : objectif global, voix de Riva et itinéraire des six districts.
- **Intro boss** : spectacle de Voltério conservé dans une plaque compacte, contrastée et placée sous le HUD.
- **Combat** : objectif permanent, conseil contextuel court et désactivable, statut accessible distinct des valeurs animées.
- **Pause** : objectif, build, commandes et trois sorties sans ambiguïté.
- **Résultat** : performance, journal de Riva, conséquence locale et build avant la prochaine décision.
- **Atelier** : choix du module replacé dans l’itinéraire de campagne.
- **Codex** : dossiers Riva/Voltério, progression chiffrée et six entrées de machine.
- **Épilogue** : bilan des six districts, temps, score, retries et build final.

Les objectifs et conseils sont séparés : désactiver `#hints-toggle` masque `#combat-hint`, jamais `#combat-objective`. Les écrans utilisent les mêmes conventions de retour, focus et titres que les menus historiques. Les nouvelles régions restent compactes sur mobile, respectent les zones sûres et conservent un fond opaque sur les effets de fumée.

## Fin

Après Crown Engine Ω, un écran d’épilogue distinct confirme la libération du Circuit, résume le temps, le score et les modules installés, puis donne accès au Laboratoire ou au menu principal.
