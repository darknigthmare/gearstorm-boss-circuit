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

## Fin

Après Crown Engine Ω, un écran d’épilogue distinct confirme la libération du Circuit, résume le temps, le score et les modules installés, puis donne accès au Laboratoire ou au menu principal.
