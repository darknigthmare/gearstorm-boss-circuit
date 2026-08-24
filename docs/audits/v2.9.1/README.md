# Audit animation, assemblage et positionnement — v2.9.1

Date : 25 août 2026
Viewport de référence : 1280 × 720, Chrome avec profil neuf.
Portée : intro, prologue et états jouables de Riva (repos, course, saut, atterrissage, tir et ruée).

## Verdict

Les défauts d'assemblage reproduits sur la v2.9.0 sont corrigés sur les états échantillonnés. Le bassin est l'unique racine d'une hiérarchie sans cycle, le torse et les membres suivent leurs parents, le canon reste rattaché à l'avant-bras et le projectile part de l'extrémité rendue du canon.

Riva est remontée visuellement de **10 px**. Ses pieds se placent maintenant dans la chaussée peinte au lieu de mordre le bord inférieur du pont. Le sol de simulation et les collisions restent à `y = 620` : ce réglage corrige la perspective sans modifier le gameplay.

## Preuves visuelles

1. [Intro méta et utile](01-story-intro.jpg) — Cassian, Riva et le canal civil portent chacun une information de jeu ou de monde.
2. [Prologue jouable](02-story-prologue.jpg) — mission M-0, enjeu civil et trajet sont explicités sans voix générique « Système ».
3. [Assemblage avant / après](03-riva-assembly-before-after.jpg) — même arène, même viewport : canon désengagé du torse, segments séparés et pieds replacés sur la route.
4. [Cycle de course](04-riva-run-cycle.jpg) — foulées opposées lisibles, appuis alternés et continuité des chaînes jambe–tibia–botte.
5. [Cycle de saut](05-riva-jump-cycle.jpg) — montée, sommet et chute produisent trois silhouettes distinctes avant la pose d'atterrissage.
6. [Tir et ruée](06-riva-fire-dash.jpg) — départ du projectile au museau dynamique ; Riva reste lisible durant l'invulnérabilité avec une transparence contrôlée.

Les mesures machine sont archivées dans [`rig-diagnostics.json`](rig-diagnostics.json) : 13 pièces anatomiques, 12 liens parent–enfant, une seule racine `pelvis`, aucune boucle, `roadLift = 10` et museau lié à `forearm-cannon-near`.

## Problèmes corrigés

- Le champ `parent` du manifeste était décoratif : les rotations de bras et de jambes ne se propageaient pas réellement.
- Le canon vertical croisait le buste et donnait l'impression d'un avant-bras fusionné.
- La course reposait surtout sur un balancement global ; les deux appuis se confondaient.
- Le saut manquait de lecture entre montée, sommet, chute et réception.
- Les pieds apparaissaient trop bas par rapport à la ligne de fuite du pont.
- Le clignotement d'invulnérabilité masquait entièrement l'héroïne pendant certains instants de ruée.
- L'intro et le prologue employaient une voix « Système » abstraite sans valeur diégétique pour la joueuse.

## Accessibilité et limites

Le mode mouvement réduit reste respecté et conserve une pose stable. La hurtbox volontairement tolérante demeure centrée sur le bas du corps ; elle n'épouse pas chaque pixel du rig. Les captures valident les états ci-dessus sur Chrome desktop, mais ne remplacent pas des essais sur manette physique, écran tactile réel, Safari/iOS, Firefox/WebKit ou lecteur d'écran.
