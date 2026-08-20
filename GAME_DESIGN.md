# GEARSTORM: Boss Circuit — conception 2.2

`DESIGN.md` reste la source de vérité du lore, de la boucle de combat, des six machines, des améliorations, de la surcharge, de l’accessibilité et de l’épilogue. Ce document fixe la couche de production et d’intégration de la version 2.2.

## Invariants de jeu

- La campagne conserve six boss, trois phases par boss et le choix d’un module après chaque victoire.
- Les télégraphes doivent rester lisibles avant toute collision dangereuse.
- Une illustration ne modifie jamais les hitboxes, les timings, les seuils de phase ou la logique de sauvegarde.
- Chaque silhouette doit rester identifiable en mouvement, en contraste standard comme renforcé.
- Clavier, souris, tactile et manette conservent la même priorité fonctionnelle.
- Le rendu procédural reste une voie valide et jouable, pas un écran d’erreur.

## Contrat artistique v2.2

Quatorze masters originaux, produits avec OpenAI Image Generation intégré, alimentent 103 assets indépendants.

| Famille | Contrat du master | Nombre de masters | Assets runtime |
| --- | --- | ---: | ---: |
| Arènes | atlas 2 × 2 : fond lointain, plan médian, premier plan, atmosphère | 6 | 24 |
| Boss | atlas 3 × 3 : neuf pièces articulables et transparentes | 6 | 54 |
| Riva Spark | atlas 3 × 3 : neuf poses ou états lisibles | 1 | 9 |
| VFX | atlas 4 × 4 : seize effets isolés | 1 | 16 |
| **Total** |  | **14** | **103** |

Les masters sont des sources de découpe. Les 103 exports doivent être indépendants, cadrés sans chevauchement parasite et nommés de manière déterministe. Les pièces de boss, Riva et les VFX exigent une véritable transparence ; aucune cellule ne peut contenir de texte, logo ou filigrane.

## Chargement runtime

1. Le key art, l’icône et l’interface de titre ont la priorité de chargement.
2. Les quatre couches d’arène, les neuf pièces du boss courant, les poses utiles de Riva et les VFX requis sont demandés progressivement.
3. `#art-loader`, `#art-loader-label` et `#art-loader-progress` exposent un retour accessible optionnel au titre ou au prologue. L’indicateur est masqué par défaut et peut être affiché, actualisé puis masqué par le runtime.
4. Une ressource validée peut entrer dans le cache PWA quand le jeu est servi en HTTP ou HTTPS.
5. En cas d’absence, délai, erreur réseau ou échec de décodage, le moteur bascule immédiatement vers le rendu procédural correspondant.
6. Le chargement visuel ne doit ni bloquer une commande de menu ni invalider une sauvegarde.

## Direction et provenance

Le langage visuel vise une illustration industrielle peinte, à silhouettes franches, contrastes lumineux et palettes propres à chaque district. Les images sont originales et spécifiques à GEARSTORM. La production via OpenAI Image Generation intégré n’autorise ni copie d’asset tiers, ni marque, ni texte incorporé.

## Distribution

La cible reste une PWA à cache versionné, servie par HTTP ou HTTPS. Le lazy loading réduit le coût initial et évite de charger les six rencontres avant qu’elles soient nécessaires ; le fallback procédural maintient la jouabilité indépendamment du cache.

Ce document spécifie le comportement attendu. Il ne certifie ni QA ni déploiement. `QA_REPORT.md` ne doit être modifié qu’après exécution et collecte de preuves pour les tests moteur, navigateur, responsive, PWA et publication.
