# Crédits et provenance

GEARSTORM: Boss Circuit est un jeu original créé pour ce projet.

## Création

- Direction, univers, personnages et machines : projet GEARSTORM.
- Moteur, gameplay et interface : HTML5 Canvas, JavaScript et Web Audio.
- Polices : pile système locale, sans police distante.
- Audio : synthèse Web Audio, sans fichier musical tiers.
- Bibliothèques et assets tiers au runtime : aucun déclaré.

## Production visuelle v2.9.1

La provenance déclarée du lot illustré v2.9.1 est OpenAI Image Generation intégré. Les 42 masters retenus ont été conçus pour GEARSTORM, sans reprise d’un asset existant, d’un personnage sous licence ou d’un key art tiers. Ils servent à la provenance et ne sont pas chargés au runtime.

| Production | Masters | Sorties runtime |
| --- | ---: | ---: |
| Six décors de campagne, quatre couches chacun | 6 | 24 |
| Six boss de campagne, neuf pièces chacun | 6 | 54 |
| Quatre planches de boss Forge 07–30 | 4 | 96 pièces |
| Six planches d’arènes Forge 07–30 | 6 | 24 backdrops |
| Riva Spark : référence et pièces OpenAI séparées | 15 | 15 assets |
| VFX 4 × 4 | 1 | 16 |
| Narration : intro, prologue et deux fins | 4 | 4 |
| **Total** | **42** | **233 WebP** |

Le key art et les icônes d’application sont également des créations originales produites pour ce projet. Les contraintes interdisent texte intégré, logo, filigrane et imitation d’une franchise. Le pipeline segmente et normalise les sorties de façon déterministe, puis enregistre dimensions, alpha, poids et SHA-256 dans le manifeste 2.9.1. Son inventaire runtime pèse 18 175 510 octets.

Riva utilise treize pièces anatomiques OpenAI indépendantes : tête, torse, bassin, deux bras, deux avant-bras dont le canon, deux cuisses, deux tibias et deux bottes. Une traînée de ruée et un halo de Surcharge complètent ses quinze assets. Le rig fixe `rootOffsetY = -23.6` et mesure le bas alpha des bottes à `feetLocalY = 36`.

Le sol physique reste `y = 620`. Les six décors campagne sont dessinés avec un offset `+80 px` et les 24 backdrops Forge avec `+28 px`, uniquement pour raccorder la route peinte à la simulation.

Les 24 machines Forge disposent chacune de quatre pièces transparentes — châssis, noyau et deux appendices — et d’un backdrop propre. Elles ne sont pas créditées comme rigs exhaustifs ni comme décors parallaxe multicouches : leurs animations secondaires sont composées par huit familles moteur partagées, avec fallback Canvas en cas d’échec de chargement.

Les masters historiques v2.7 restent documentés ; la source de vérité courante est `assets/generated/v2.9.1/asset-manifest.json`.

## Écriture et expérience

L’intro, le prologue, les six actes, les interludes, l’épilogue, les transmissions, les dossiers Codex et les 18 contrats de maîtrise de campagne sont des créations originales du projet. Leur source structurée est `story.js`. Quatre images originales OpenAI illustrent l’intro, le prologue, la fin de campagne et la fin Forge sans remplacer les textes accessibles.

Riva Spark est la technicienne qui a conçu la ligne de maintenance manuelle M-0. Cassian Voltério, ancien architecte du réseau, a centralisé dans la Couronne les commandes des six infrastructures civiles et transformé leurs machines en spectacle coercitif. Son programme adaptatif apprend des victoires de Riva ; la contre-phase M-0 injectée dans la Fournaise permet ensuite de neutraliser son commandement sans détruire le Circuit.

Les six districts — Rocade des Rivets, Couloir des Hautes-Tensions, Fosse Ferromagnétique, Horloge de la Faille, Fournaise des Pistons et Citadelle Voltério — suivent les six machines établies. L’épilogue rend les commandes aux équipes locales, place Cassian en détention et confirme le refus de Riva de devenir une nouvelle autorité centrale.

La conception UX v2.9 ajoute le commentaire méta aux surfaces de jeu et de narration, tout en laissant tutoriels, aides, objectifs critiques et libellés d’accessibilité factuels. Elle conserve les garanties de fiabilité v2.8 : six manches obligatoires d’ENDURANCE ENGINE, retries et offres d’Atelier déterministes, préférences système au premier lancement, sauvegarde portable et mise à jour PWA consentie.

## Forge jouable 07–30

`expansion-story.js` contient le registre narratif original des 24 boss Forge : quatre vagues, fonctions civiques, objectifs, trois phases, journaux, interludes, `metaLine`, Codex, restaurations et 72 contrats de maîtrise. `boss-roster.js` leur attribue 24 `mechanicId` et 72 états uniques au-dessus de huit familles socles enrichies. Le Codex v2.9 archive ces 24 transmissions dans un panorama des quatre anneaux.

Les 72 contrats Forge sont instrumentés ; leur mutualisation télémétrique par famille est assumée et aucune réussite inconnue n’est accordée par défaut. Avec les 18 contrats de campagne, le total est de 90 contrats pour 30 boss et 90 phases.

Le Circuit Forge 07–30 conserve reprise, améliorations et fin dans la sauvegarde locale v5 sans avancer les six relais de campagne. La v2.9 ne modifie pas le schéma v5 et remplace le pack runtime courant par le manifeste visuel v2.9.1.

Quatre planches 3 × 2 couvrent les boss 07–12, 13–18, 19–24 et 25–30 ; six planches supplémentaires couvrent leurs arènes par groupes de quatre. Les nouvelles sources de Riva sont consignées dans `assets/generated/riva-v2.9-sources/PROVENANCE.md` et les images narratives dans `assets/generated/narrative-v2.9-sources/PROVENANCE.md`. La segmentation ne repeint pas les sources ; le manifeste 2.9.1 est la source de vérité des 233 fichiers runtime.

## Fallback procédural

Les silhouettes, arènes, projectiles et effets dessinés par le moteur Canvas constituent une création procédurale interne et restent disponibles comme fallback. Ils garantissent une représentation jouable lorsque le chargement d’une image échoue, sans dépendance visuelle distante.

## Limite de ce document

Ce crédit documente auteurs, provenance et contrat de production. Il ne vaut pas certification de build, de QA, de test matériel, de commit, de push ou de déploiement public.
