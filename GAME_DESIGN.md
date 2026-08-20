# GEARSTORM: Boss Circuit — conception 2.3

`DESIGN.md` reste la source de vérité du lore, de la boucle de combat, des six machines, des améliorations, de la surcharge et de l’épilogue. Ce document fixe la couche de production, de narration interactive et d’intégration UX de la version 2.3.

## Invariants de jeu

- La campagne conserve six boss, trois phases par boss et le choix d’un module après chaque victoire.
- Les télégraphes restent lisibles avant toute collision dangereuse.
- Une illustration ou un texte d’aide ne modifie jamais les hitboxes, les timings, les seuils de phase ou la logique de sauvegarde.
- Chaque silhouette reste identifiable en mouvement, en contraste standard comme renforcé.
- Clavier, souris, tactile et manette conservent la même priorité fonctionnelle.
- Le rendu procédural reste une voie valide et jouable, pas un écran d’erreur.
- L’objectif critique demeure visible même lorsque les conseils contextuels sont désactivés.

## Progression narrative des six districts

Voltério a relié les infrastructures du Circuit en chaîne : chaque machine contrôle un district et alimente le verrou suivant. Les victoires de Riva sont donc à la fois mécaniques et civiles.

| Étape | District | Machine | Enjeu | Conséquence de la victoire |
| ---: | --- | --- | --- | --- |
| 01 | Rocade des Rivets | Rivet Rex | Axes de transport sous couvre-feu | Le premier verrou cède et Voltério identifie Riva comme une menace. |
| 02 | Couloir des Hautes-Tensions | Sky Slicer | Brouillage aérien et isolement du nord | Les transmissions civiles reviennent vers les districts du nord. |
| 03 | Fosse Ferromagnétique | Magnetron | Rails d’évacuation immobilisés | Les habitants peuvent quitter les gradins forcés. |
| 04 | Horloge de la Faille | Chrono Mantis | Horloges et archives temporelles manipulées | Le Circuit enregistre de nouveau les secondes que Voltério voulait effacer. |
| 05 | Fournaise des Pistons | Foundry Titan | Production énergétique du spectacle coercitif | La fonderie refroidit et la Couronne perd sa dernière alimentation externe. |
| 06 | Citadelle Voltério | Crown Engine Ω | Nœud de commandement composite | La Couronne tombe et le Circuit revient à ceux qui y vivent. |

Riva Spark reste une technicienne de maintenance devenue pilote par nécessité. Elle gagne grâce à sa connaissance du réseau, sa lecture des cycles et l’adaptation de son équipement. Cassian Voltério demeure un ingénieur-showman : il transforme chaque échec en nouvelle mise en scène jusqu’à ce que son système ne puisse plus masquer la libération des districts.

## Parcours d’un jeu complet

1. Le titre expose l’état de campagne, la prochaine cible et les entrées Rush, reprise, Laboratoire, Codex, manuel et options.
2. Le prologue donne l’objectif global et montre la route des six districts sans imposer de tutoriel.
3. L’intro de machine présente le district, la silhouette et la voix de Voltério dans une plaque contrastée sous le HUD.
4. Le combat maintient un objectif bref et ajoute, si autorisé, un conseil contextuel lors d’une mécanique nouvelle.
5. La pause rappelle objectif, build et commandes sans faire perdre le contexte.
6. Le résultat relie performance, build et conséquence narrative avant la décision suivante.
7. L’atelier rend visible la progression vers le district suivant et l’effet du build.
8. Le Codex conserve les informations débloquées et permet de relire Riva, Voltério, machines et districts.
9. L’épilogue confirme la libération des six secteurs et donne accès au Laboratoire.

## Contrat des hooks UX

Tous les IDs v2.2 sont conservés. Les hooks v2.3 sont ajoutés sans modifier leur sémantique par CSS.

| Hook | État initial | Comportement requis |
| --- | --- | --- |
| `#continue-run` | `hidden` | N’apparaître qu’avec une reprise valide, préciser sa destination et restaurer la campagne normalisée. |
| `#campaign-progress`, `#campaign-next` | Texte de nouveau jeu | Refléter les districts libérés, la prochaine cible et la complétion. |
| `#codex`, `#codex-screen` | Écran fermé | Ouvrir/fermer via le gestionnaire d’écrans et restituer le focus. |
| `#codex-grid`, `#codex-progress` | Aucun dossier de victoire | Synchroniser attribut `data-state`, libellé d’état, détails cachés et progression sauvegardée. |
| `#combat-objective` | Briefing masqué hors combat | Décrire l’action nécessaire pour le boss ou la phase en cours. |
| `#combat-hint` | Conseil générique | Présenter une seule instruction courte lors d’une nouvelle mécanique, jamais à chaque frame. |
| `#hints-toggle` | Activé | Persister le choix et masquer uniquement les conseils, pas l’objectif. |
| `#pause-objective`, `#pause-build` | Valeurs de repli | Reprendre le contexte du combat et `describeBuild()`. |
| `#result-lore`, `#result-build` | Valeurs de repli | Afficher la transmission du district et le build après victoire. |

Les hooks complémentaires `#continue-run-detail`, `#lab-progress`, `#upgrade-progress`, `#upgrade-build` et `#gameover-hint` complètent le texte visible mais ne remplacent aucun état moteur.

## Onboarding et accessibilité

- Le prologue explique le but du Circuit ; il ne bloque pas le contrôle du joueur par une séquence obligatoire.
- Les conseils apparaissent à des moments significatifs, restent courts et peuvent être désactivés.
- L’objectif actif, les changements de phase et les résultats utilisent des annonces polies et atomiques ; les valeurs animées image par image ne sont pas annoncées.
- Le Codex conserve une hiérarchie de titres et des états textuels « accessible » ou « chiffrée », sans dépendre de la couleur seule.
- La pause est un dialogue modal et restitue un chemin clair vers reprise, nouvelle tentative ou menu.
- Les plaques de briefing restent sous le HUD, évitent les commandes tactiles et utilisent un fond suffisamment opaque sur fumée ou orange lumineux.
- Le contraste renforcé et `prefers-contrast` durcissent les bordures et les fonds ; le mouvement réduit neutralise les animations non essentielles.
- Les petits écrans réorganisent le Codex, les récapitulatifs et les commandes en une colonne sans réduire les cibles sous 44 × 44 CSS px.

## Contrat artistique v2.2

Quatorze masters originaux, produits avec OpenAI Image Generation intégré, alimentent 103 assets indépendants.

| Famille | Contrat du master | Nombre de masters | Assets runtime |
| --- | --- | ---: | ---: |
| Arènes | atlas 2 × 2 : fond lointain, plan médian, premier plan, atmosphère | 6 | 24 |
| Boss | atlas 3 × 3 : neuf pièces articulables et transparentes | 6 | 54 |
| Riva Spark | atlas 3 × 3 : neuf poses ou états lisibles | 1 | 9 |
| VFX | atlas 4 × 4 : seize effets isolés | 1 | 16 |
| **Total** |  | **14** | **103** |

Les masters sont des sources de découpe. Les exports restent indépendants, cadrés sans chevauchement parasite, sans texte, logo ni filigrane. Les pièces de boss, Riva et les VFX exigent une véritable transparence.

## Chargement runtime et PWA

1. Le key art, l’icône et l’interface de titre ont la priorité.
2. Les couches d’arène, les pièces du boss courant, les poses utiles de Riva et les VFX requis sont demandés progressivement.
3. `#art-loader`, `#art-loader-label` et `#art-loader-progress` exposent un retour accessible optionnel.
4. Une ressource validée peut entrer dans le cache PWA quand le jeu est servi en HTTP ou HTTPS.
5. En cas d’absence, délai, erreur réseau ou échec de décodage, le moteur bascule vers le rendu procédural.
6. Le chargement visuel ne bloque ni une commande de menu, ni une sauvegarde, ni un objectif critique.

## Distribution et preuve

La cible reste une PWA à cache versionné, servie par HTTP ou HTTPS. Le lazy loading réduit le coût initial ; le fallback procédural maintient la jouabilité indépendamment du cache.

Ce document spécifie le comportement attendu. Il ne certifie ni QA ni déploiement. `QA_REPORT.md` ne doit être modifié qu’après collecte de preuves pour les tests moteur, navigateur, responsive, accessibilité, PWA et publication.
