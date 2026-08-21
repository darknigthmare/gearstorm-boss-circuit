# Crédits et provenance

GEARSTORM: Boss Circuit est un jeu original créé pour ce projet.

## Création

- Direction, univers, personnages et machines : projet GEARSTORM.
- Moteur, gameplay et interface : HTML5 Canvas, JavaScript et Web Audio.
- Polices : pile système locale, sans police distante.
- Audio : synthèse Web Audio, sans fichier musical tiers.
- Bibliothèques et assets tiers au runtime : aucun déclaré.

## Production visuelle v2.7

La provenance déclarée du lot illustré est OpenAI Image Generation intégré. Les vingt-six masters retenus ont été conçus pour GEARSTORM, sans reprise d’un asset existant, d’un personnage sous licence ou d’un key art tiers. Ils servent à la provenance et ne sont pas chargés au runtime.

| Production | Masters | Sorties runtime |
| --- | ---: | ---: |
| Six décors de campagne, quatre couches chacun | 6 | 24 |
| Six boss de campagne, neuf pièces chacun | 6 | 54 |
| Quatre planches de boss Forge 07–30 | 4 | 96 pièces |
| Six planches d’arènes Forge 07–30 | 6 | 24 backdrops |
| Riva Spark : atlas historique + corps v4 + bras-canon v4 | 3 | 11 pièces |
| VFX 4 × 4 | 1 | 16 |
| **Total** | **26** | **225 WebP** |

Le key art et les icônes d’application sont également des créations originales produites pour ce projet. Les contraintes interdisent texte intégré, logo, filigrane et imitation d’une franchise. Le pipeline segmente et normalise les sorties de façon déterministe, puis enregistre dimensions, alpha, poids et SHA-256 dans le manifeste 2.7.0.

Riva utilise un corps complet cohérent, avec buste, taille, bassin, jambes et bottes dans la même pièce. Le pivot de semelles est aligné sur le sol logique du pont, le torse n’est plus empilé avec d’anciens fragments et une unique pièce bras-canon se raccorde au socket d’épaule. L’ombre reste un contact discret sous les pieds.

Les 24 machines Forge disposent chacune de quatre pièces transparentes — châssis, noyau et deux appendices — et d’un backdrop propre. Elles ne sont pas créditées comme rigs exhaustifs ni comme décors parallaxe multicouches : les animations secondaires sont composées par les huit familles moteur, avec fallback Canvas en cas d’échec de chargement.

## Écriture et expérience

L’intro, le prologue, les six actes, les interludes, l’épilogue, les transmissions, les dossiers Codex et les dix-huit contrats de maîtrise sont des créations originales du projet. Leur source structurée est `story.js`.

Riva Spark est la technicienne qui a conçu la ligne de maintenance manuelle M-0. Cassian Voltério, ancien architecte du réseau, a centralisé dans la Couronne les commandes des six infrastructures civiles et transformé leurs machines en spectacle coercitif. Son programme adaptatif apprend des victoires de Riva ; la contre-phase M-0 injectée dans la Fournaise permet ensuite de neutraliser son commandement sans détruire le Circuit.

Les six districts — Rocade des Rivets, Couloir des Hautes-Tensions, Fosse Ferromagnétique, Horloge de la Faille, Fournaise des Pistons et Citadelle Voltério — suivent les six machines déjà établies. L’épilogue rend les commandes aux équipes locales, place Cassian en détention et confirme le refus de Riva de devenir une nouvelle autorité centrale.

La conception UX v2.4 couvre l’ouverture narrative, les interludes de district, le briefing de combat, le Codex, les archives M-0, la reprise de progression, les récapitulatifs de build, l’aide en pause et les états accessibles/mobile. Les hooks DOM sont documentés séparément du code de gameplay afin de préserver leur stabilité.

## Forge jouable 07–30

`expansion-story.js` contient le registre narratif original des vingt-quatre boss Forge : quatre vagues, fonctions civiques, objectifs, trois phases, journaux, Codex, restaurations et soixante-douze contrats de maîtrise. `boss-roster.js` leur attribue vingt-quatre `mechanicId` et soixante-douze états uniques au-dessus de huit familles socles enrichies. Les 72/72 contrats Forge sont instrumentés ; leur mutualisation télémétrique par famille est assumée et aucune réussite inconnue n’est accordée par défaut. Le Circuit Forge 07–30 conserve reprise, améliorations et fin dans la sauvegarde locale v5 sans avancer les six relais de campagne.

Quatre planches 3 × 2 générées avec OpenAI ImageGen couvrent les boss 07–12, 13–18, 19–24 et 25–30 ; six planches supplémentaires couvrent leurs arènes par groupes de quatre. La segmentation fournit quatre pièces et un backdrop par machine sans peindre de nouveau contenu dans le processeur. Les sources de boss sont consignées dans `assets/generated/expansion-sources/PROVENANCE.md`, celles des décors dans `assets/generated/forge-arena-sources/PROVENANCE.md` ; le manifeste 2.7.0 est la source de vérité des 225 fichiers runtime.

## Fallback procédural

Les silhouettes, arènes, projectiles et effets dessinés par le moteur Canvas constituent une création procédurale interne et restent disponibles comme fallback. Ils garantissent une représentation jouable lorsque le chargement d’une image échoue, sans dépendance visuelle distante.

Ce crédit documente la provenance et le contrat de production. Il ne vaut pas certification de build, de QA ou de déploiement.
