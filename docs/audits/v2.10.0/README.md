# Audit complet du jeu — v2.10.0

Audit réalisé le 25 août 2026 sur le build public v2.9.1, puis sur la version locale corrigée. Les captures `before/` ont été enregistrées avant toute modification de code dans cette passe.

## Parcours capturés avant correction

1. Menu titre desktop — hiérarchie, accès aux modes et état de progression.
2. Introduction — émission de Cassian et entrée de M-0.
3. Prologue — version rendue dans l’écran narratif générique.
4. Combat desktop au repos — appuis, route et canon.
5. Tir maintenu — alignement canon/projectile.
6. Course — assemblage du rig en mouvement.
7. Saut et tir — cumul des rotations du canon.
8. Catalogue intégral et Circuit Forge.
9. Codex et Archives M-0.
10. Options et accessibilité.
11. Menu titre mobile 412 × 915.
12. Combat tactile mobile 412 × 915.

## Défauts confirmés avant correction

- Le canon est horizontal au repos, mais les rotations hiérarchiques du torse, du bras, du saut, de la course, du recul et de la ruée le désalignent d’un projectile qui reste horizontal.
- Le point d’émission déclaré est décalé de sept pixels par rapport au centre optique de l’asset.
- Le prologue possède un écran riche inutilisé et une seconde version rendue dans l’écran narratif générique.
- Le titre des Archives annonce huit transmissions tandis que le runtime en construit neuf.
- Une victoire en Laboratoire ou catalogue libre affiche des restaurations civiles canoniques réservées au Circuit Forge séquentiel.
- Le clavier bloque Espace et les flèches sur les contrôles natifs hors combat.
- Des sauvegardes contradictoires peuvent conserver une campagne terminée à un seul boss débloqué ou reprendre sur un checkpoint final impossible.
- Les voies sûres, la séquence de Logic Crucible et la réserve d’Orbital Famine ne disposent pas de tous les signaux non chromatiques promis.
- Le lore explique souvent le HUD et les règles de développement au lieu d’exposer l’histoire de Riva, la Couronne et la Gearstorm.

## Parcours recapturés après correction

1. Menu titre desktop — hiérarchie et accès campagne/catalogue/Forge cohérents.
2. Introduction — enjeu de la Couronne posé sans jargon de système inutile.
3. Prologue — écran narratif dédié, lisible en deux colonnes sans débordement.
4. Combat desktop au repos — appuis sur la route et canon articulé aligné.
5. Tir maintenu — recul visible et projectile émis dans l’axe du canon.
6. Course — bassin, torse, tête, bras et jambes restent assemblés.
7. Saut et tir — rotations cumulées sans désalignement du point d’émission.
8. Catalogue intégral — 30 simulations annoncées hors chronologie et Circuit Forge verrouillé avant la fin de campagne.
9. Codex — neuf transmissions, révélations et archives Forge relisibles.
10. Options — libellés, import/export et retour de focus cohérents.
11. Menu titre mobile 412 × 915 — aucune coupure horizontale observée.
12. Combat tactile mobile 412 × 915 — commandes essentielles visibles et utilisables.

## Résultat de la passe

- Le point d’émission réel est fixé à `[149, 297]`. L’erreur de visée mesurée sur neuf poses reste comprise entre `0` et environ `1,32 × 10⁻16` radian.
- Le recul vaut `12 px` dans l’espace local, soit `13,2 px` sur le Canvas. L’asset `forearm-cannon-near` combine honnêtement l’avant-bras et le canon ; il ne s’agit pas de deux pièces indépendantes.
- Riva conserve `roadLift = 10`, la tête est descendue de `4 px` et la poussière d’atterrissage rejoint la chaussée à `y = 610`.
- Le prologue dédié est utilisé, les neuf transmissions sont cohérentes et les résultats de simulation ne modifient plus les restitutions civiles canoniques.
- Le Catalogue est explicitement hors chronologie ; le Circuit Forge est une suite canonique post-campagne.
- La Couronne est abolie, Cassian reste détenu et M-0 devient un protocole public distribué entre les six districts sans clé maîtresse.
- Les sauvegardes, le cache PWA, le LRU raster, la navigation clavier, le retour de focus et les signaux non chromatiques ont été durcis.

## Santé générale du parcours

| Étape | État après correction |
| --- | --- |
| Titre, introduction et prologue | Sain |
| Combat, rig, canon et perspective | Sain sur Chrome desktop/mobile contrôlé |
| Campagne, reprise et sauvegardes | Sain selon contrats automatisés |
| Catalogue, Laboratoire et Circuit Forge | Sain ; chronologie explicitée |
| Codex, histoire et lore | Sain ; contenu relisible et conséquences verrouillées |
| Options, clavier, tactile, accessibilité et PWA | Sain sur le périmètre automatisé |

## Preuves locales

- `84/84` tests Node et `npm run qa` réussis.
- Build de `21 735 065` octets : 30 boss, 90 phases, 90 contrats de maîtrise et 233 WebP runtime pour `18 175 510` octets.
- Audit npm : aucune vulnérabilité.
- Audit agent-browser Chrome à 1440 × 900 et 412 × 915 : aucune erreur console ou réseau observée.
- axe : aucune violation déterministe sur le Codex desktop et le combat mobile ; le contraste du gradient Canvas reste indéterminé.

## Limites honnêtes

- Aucun contrôleur, appareil tactile physique, lecteur d’écran réel, Firefox ou WebKit n’a été testé dans cette passe.
- Le portrait fonctionne, mais le paysage reste recommandé pour la largeur tactique.
- Les records ne sont pas encore segmentés par mode, difficulté et version.
- Les 24 arènes Forge restent monocouches ; les 24 rigs utilisent quatre pièces spécialisées au-dessus de huit familles moteur partagées.
- La publication distante v2.10.0 reste à confirmer par commit, push, GitHub Actions, Vercel Ready et contrôles HTTP publics.

Les dossiers `before/` et `after/` contiennent chacun les douze états numérotés ci-dessus avec le même cadrage fonctionnel.
