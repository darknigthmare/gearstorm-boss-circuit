# GEARSTORM: Boss Circuit — conception 2.1

La documentation de conception de référence se trouve dans `DESIGN.md`. Elle décrit le lore original, la boucle de combat, les six machines en trois phases, les améliorations, la surcharge, l’accessibilité et l’épilogue.

La version 2.1 complète cette conception par une couche de production destinée à la distribution :

- progression locale versionnée et récupération des sauvegardes invalides ;
- contrôles clavier, souris, tactile et manette ;
- options d’accessibilité persistantes ;
- PWA installable et cache hors ligne versionné ;
- bundle Vercel limité aux seuls fichiers publics ;
- tests des contrats gameplay, du serveur local et de l’intégrité de release.

`DESIGN.md` reste la source de vérité pour le contenu du jeu. `README.md` et `QA_REPORT.md` décrivent respectivement l’exploitation et les validations réellement exécutées.
