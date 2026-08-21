# Crédits et provenance

GEARSTORM: Boss Circuit est un jeu original créé pour ce projet.

## Création

- Direction, univers, personnages et machines : projet GEARSTORM.
- Moteur, gameplay et interface : HTML5 Canvas, JavaScript et Web Audio.
- Polices : pile système locale, sans police distante.
- Audio : synthèse Web Audio, sans fichier musical tiers.
- Bibliothèques et assets tiers au runtime : aucun déclaré.

## Production visuelle v2.6

La provenance déclarée du lot illustré est OpenAI Image Generation intégré. Les vingt sources retenues ont été conçues pour GEARSTORM, sans reprise d’un asset existant, d’un personnage sous licence ou d’un key art tiers.

| Production | Sources | Sorties runtime |
| --- | ---: | ---: |
| Six décors de campagne, quatre couches chacun | 6 | 24 |
| Six boss de campagne, neuf pièces chacun | 6 | 54 |
| Quatre planches Forge couvrant les boss 07–30 | 4 | 24 sprites |
| Riva Spark : atlas historique + corps v4 + bras-canon v4 | 3 | 11 pièces |
| VFX 4 × 4 | 1 | 16 |
| **Total** | **20** | **129 WebP** |

Le key art et les icônes d’application sont également des créations originales produites pour ce projet. Les contraintes interdisent texte intégré, logo, filigrane et imitation d’une franchise. Le pipeline retire déterministement le damier RGB aplati, nettoie uniquement les îlots alpha parasites, normalise les sorties et enregistre taille et SHA-256 dans le manifeste v2.6.

Riva utilise désormais un corps complet cohérent, avec buste, taille, bassin, jambes et bottes dans la même pièce. Son pivot de semelle est aligné sur le sol logique du pont. Une unique pièce bras-canon indépendante se raccorde au socket d’épaule ; les anciens fragments ne sont plus composés dans le rig de production.

Les 24 machines Forge disposent chacune d’un sprite transparent propre. Elles ne sont pas créditées comme rigs multipièces : leurs animations secondaires et leurs arènes sont actuellement procédurales, avec fallback Canvas en cas d’échec de chargement.

## Écriture et expérience v2.4

L’intro, le prologue, les six actes, les interludes, l’épilogue, les transmissions, les dossiers Codex et les dix-huit contrats de maîtrise sont des créations originales du projet. Leur source structurée est `story.js`.

Riva Spark est la technicienne qui a conçu la ligne de maintenance manuelle M-0. Cassian Voltério, ancien architecte du réseau, a centralisé dans la Couronne les commandes des six infrastructures civiles et transformé leurs machines en spectacle coercitif. Son programme adaptatif apprend des victoires de Riva ; la contre-phase M-0 injectée dans la Fournaise permet ensuite de neutraliser son commandement sans détruire le Circuit.

Les six districts — Rocade des Rivets, Couloir des Hautes-Tensions, Fosse Ferromagnétique, Horloge de la Faille, Fournaise des Pistons et Citadelle Voltério — suivent les six machines déjà établies. L’épilogue rend les commandes aux équipes locales, place Cassian en détention et confirme le refus de Riva de devenir une nouvelle autorité centrale.

La conception UX v2.4 couvre l’ouverture narrative, les interludes de district, le briefing de combat, le Codex, les archives M-0, la reprise de progression, les récapitulatifs de build, l’aide en pause et les états accessibles/mobile. Les hooks DOM sont documentés séparément du code de gameplay afin de préserver leur stabilité.

## Forge jouable 07–30

`expansion-story.js` contient le registre narratif original des vingt-quatre boss Forge : quatre vagues, fonctions civiques, objectifs, trois phases, journaux, Codex, restaurations et soixante-douze contrats de maîtrise. `boss-roster.js` les relie au moteur via huit familles de patterns partagées. Le statut runtime est intégré ; une victoire Forge archive sa performance sans avancer les six relais de campagne.

Quatre planches 3 × 2 générées avec OpenAI ImageGen couvrent les boss 07–12, 13–18, 19–24 et 25–30. Le générateur ayant aplati l’aperçu de transparence en RGB, le damier neutre est retiré par `extract_alpha()` sans peinture ni invention de pixels. Les sources, prompts disponibles, hachages, dérivés et limites sont consignés dans `assets/generated/expansion-sources/PROVENANCE.md`.

## Fallback procédural

Les silhouettes, arènes, projectiles et effets dessinés par le moteur Canvas constituent une création procédurale interne et restent disponibles comme fallback. Ils garantissent une représentation jouable lorsque le chargement d’une image échoue, sans dépendance visuelle distante.

Ce crédit documente la provenance et le contrat de production. Il ne vaut pas certification de build, de QA ou de déploiement.
