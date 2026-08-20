# Crédits et provenance

GEARSTORM: Boss Circuit est un jeu original créé pour ce projet.

## Création

- Direction, univers, personnages et machines : projet GEARSTORM.
- Moteur, gameplay et interface : HTML5 Canvas, JavaScript et Web Audio.
- Polices : pile système locale, sans police distante.
- Audio : synthèse Web Audio, sans fichier musical tiers.
- Bibliothèques et assets tiers au runtime : aucun déclaré.

## Production visuelle v2.2

La provenance déclarée du lot illustré est OpenAI Image Generation intégré. Les 14 masters ont été conçus pour GEARSTORM, sans reprise d’un asset existant, d’un personnage sous licence ou d’un key art tiers.

| Production | Masters | Sorties indépendantes |
| --- | ---: | ---: |
| Six atlases de décors, quatre couches de parallaxe chacun | 6 | 24 |
| Six atlases de boss, neuf pièces transparentes chacun | 6 | 54 |
| Un atlas Riva Spark, neuf poses / états | 1 | 9 |
| Un atlas VFX 4 × 4 | 1 | 16 |
| **Total** | **14** | **103** |

Le key art et l’icône d’application sont également des créations originales générées avec OpenAI Image Generation pour ce projet.

Les contraintes de production interdisent texte intégré, logo, filigrane et imitation d’une franchise. Les exports de boss, Riva et VFX doivent conserver une véritable transparence alpha. Les 14 masters servent de sources ; les 103 assets indépendants sont découpés, nommés et chargés comme des ressources autonomes.

Au runtime, le lazy loading privilégie le titre puis la rencontre courante. Les ressources valides peuvent rejoindre le cache PWA ; le fallback procédural reste disponible si leur chargement ou leur décodage échoue.

## Fallback procédural

Les silhouettes, arènes, projectiles et effets dessinés par le moteur Canvas constituent une création procédurale interne et restent disponibles comme fallback. Ils garantissent une représentation jouable lorsque le chargement d’une image échoue, sans dépendance visuelle distante.

Ce crédit documente la provenance et le contrat de production. Il ne vaut pas certification de build, de QA ou de déploiement.
