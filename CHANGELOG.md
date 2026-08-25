# Historique des versions

## 2.10.0 — La Couronne rend les clés

- Fermeture de l’arc canonique : le mandat de la Couronne est aboli, Cassian Voltério reste détenu, M-0 devient un protocole public distribué entre six équipes et aucune clé maîtresse ne subsiste.
- Clarification des modes : le Circuit Forge 07–30 est une suite canonique post-campagne, tandis que le Catalogue des 30 machines reste une simulation libre hors chronologie et n’altère aucune restitution civile.
- Extension des archives à neuf transmissions relisibles, quatre révélations d’anneau, vingt-quatre journaux de Riva et soixante-douze voix de phase Forge.
- Correction définitive du tir articulé de Riva : erreur angulaire maximale observée d’environ `1,32 × 10⁻16`, museau `[149, 297]`, recul de `12 px` local soit `13,2 px` Canvas. L’asset proche `forearm-cannon-near` combine l’avant-bras et le canon ; il ne s’agit pas de deux pièces séparées.
- Recalage de la silhouette sur la route avec `roadLift = 10`, abaissement de tête `headDrop = 4` et poussière de contact à `y = 610`, sans déplacer le sol physique.
- Normalisation des sauvegardes contradictoires, récupération d’une v4 valide si une v5 est corrompue, assainissement des checkpoints finaux et conservation d’une migration chargée même si la persistance échoue par dépassement de quota.
- Durcissement PWA et mémoire : les refus d’écriture `cache.put` ne masquent plus une réponse réseau valide et le cache raster applique un LRU limité à trois bundles de boss sans expulser le rig de Riva.
- Ajout de signaux non chromatiques pour les voies sûres, la séquence de LOGIC CRUCIBLE, la réserve d’ORBITAL FAMINE et les environnements directionnels.
- Cinq maîtrises Forge utilisent désormais leur cause exacte : cibles prioritaires de HIVE FOREMAN, diversité complète de phase 2 d’ECHO FENCER, modules propres de BREAKER ARRAY, trois vannes dans un même cycle de FLOODLINE LEVIATHAN et quatre ricochets successifs de VECTOR VAULT.
- Correction du parcours clavier et du retour de focus : combat → pause → titre → Options → retour restitue `#settings` hors arbre `inert`.
- Validation locale : `84/84` tests Node, `npm run qa` vert, build de `21 735 065` octets, 233 WebP pour `18 175 510` octets artistiques, audit npm sans vulnérabilité, 12 captures Chrome avant et 12 après, audit axe sans violation sur Codex desktop et combat mobile.
- Publication vérifiée : commits `b65b027` puis `bc0129a` poussés sur `main`, CI `32871248113` verte avec 26 parcours Chromium réussis, audit npm sans vulnérabilité, Vercel `dpl_AgHpmCoLwomtZ6Xj51LcThcZdha9` `READY` et alias public HTTP 200. La première CI a révélé une double lecture instable de la ruée tactile de 190 ms ; le second commit capture désormais l’état au moment exact où il est observé.

## 2.9.1 — Riva reprend la route

- Activation d'une vraie hiérarchie de rig : `pelvis` est l'unique racine, les douze liens parent–enfant sont propagés et les cycles sont refusés par contrat.
- Recalage des pivots de tête, torse, bassin, bras, avant-bras, cuisses, tibias et bottes ; le canon ne traverse plus le buste.
- Ajout de poses distinctes pour course, montée, sommet, chute, réception, visée, recul et ruée, avec variante stable lorsque le mouvement réduit est actif.
- Remontée visuelle de Riva de `10 px` sur la route, ombre comprise, sans déplacer le sol physique `y = 620` ni la hurtbox tolérante.
- Départ des tirs calculé depuis le museau du WebP `forearm-cannon-near` après transformation complète du rig.
- Remplacement de la disparition totale en invulnérabilité par une transparence contrôlée : l'héroïne reste visible pendant la ruée et les impacts.
- Réécriture de l'intro, du prologue et des communications de phase : narration méta portée par Riva, Cassian et les relais civils, sans voix générique « Système ».
- Numérotation canonique des machines 01–06 et Forge 07–30 sur les cartes, reprises, résultats et entrées du Codex.
- Nouveau runtime artistique immuable `assets/generated/v2.9.1/` : 233 WebP, manifeste et sources de provenance conservés.
- Audit illustré 1280 × 720, 76/76 tests Node, 13 parcours Chromium réussis, audit npm sans vulnérabilité, CI GitHub verte et production Vercel Ready.

## 2.9.0 — La route retrouve Riva

- Remplacement du composite de Riva par un rig natif de treize pièces anatomiques indépendantes, plus la traînée de ruée et le halo de Surcharge.
- Calage du rig sur `rootOffsetY = -23.6` et `feetLocalY = 36`, avec contrôle de la limite alpha réelle des bottes sur la ligne de contact.
- Conservation du sol physique à `y = 620` et correction de perspective par offsets purement visuels : `+80 px` pour les six arènes de campagne et `+28 px` pour les backdrops Forge.
- Nouveau manifeste artistique v2.9.0 : 42 masters originaux OpenAI, 233 WebP runtime et 18 175 510 octets, répartis en 48 assets d’arène, 150 pièces de boss, 15 assets héroïne, 16 VFX et 4 images narratives.
- Ajout de quatre images narratives dédiées à l’intro, au prologue, à la fin de campagne et à la fin du Circuit Forge.
- Archivage permanent des 24 interludes et `metaLine` Forge dans le Codex, structurés autour des quatre anneaux et repris dans les résultats de combat.
- Extension du ton méta aux surfaces de jeu et de narration ; les tutoriels, aides, objectifs critiques et libellés d’accessibilité restent explicites et non méta.
- La sauvegarde reste en schéma v5 et les 30 boss, 90 phases et 90 contrats restent stables.
- Release validée par 75/75 tests Node, 13 parcours Chromium réussis, audit npm sans vulnérabilité, GitHub Actions vert et déploiement Vercel Ready.

## 2.8.0 — Circuit fiable

- ENDURANCE ENGINE déroule désormais ses six manches : les seuils de phase exigent les manches 2, 4 puis 6, ce qui empêche un haut DPS de court-circuiter son épreuve.
- Les checkpoints de campagne et du Circuit Forge conservent le nombre de nouvelles tentatives du boss courant ; un checkpoint Atelier conserve aussi exactement l’offre de modules affichée afin qu’une reprise ne la relance pas.
- Ajout de contrôles d’export JSON v5 normalisé et d’import limité à 1 Mio. L’import passe par la migration/normalisation existante avant persistance et resynchronisation ; le runtime reste tolérant si ces hooks DOM ne sont pas rendus.
- Une sauvegarde réellement neuve initialise mouvement réduit et contraste renforcé depuis les préférences du système ; une sauvegarde existante ou migrée garde toujours les choix de la joueuse.
- Les cartes déverrouillées de la Forge peuvent afficher une miniature décorative issue des pièces WebP réelles, sans remplacer leur nom ni leur libellé accessible.
- Le runtime PWA détecte un service worker en attente et ne lui demande `SKIP_WAITING` qu’après une action explicite sur le hook de mise à jour ; la première installation reste silencieuse et un seul rechargement suit le changement de contrôleur.
- Le pack artistique reste le manifeste immuable 2.7.0 : 26 masters de provenance et 225 WebP runtime. La sauvegarde reste en schéma v5 ; le contenu reste fixé à 30 boss, 90 phases et 90 contrats de maîtrise.
- Les parcours Playwright Chromium couvrent aussi le focus clavier, les cibles de 44 CSS px, l’export JSON, l’import normalisé, les préférences système au premier lancement, une Gamepad API simulée et le rechargement hors ligne. Le consentement d’un worker réellement `waiting` reste couvert par contrats Node ; Firefox et WebKit sont configurés en opt-in mais aucune exécution n’est revendiquée ici. Cette entrée ne certifie ni QA finale, ni test matériel, ni commit, ni push, ni déploiement public.

## 2.7.0 — Les quatre anneaux

- Ajout du Circuit Forge séquentiel des machines 07 à 30 : quatre vagues de six combats, choix de module entre les boss et écran de restauration final.
- Migration vers la sauvegarde locale v5 avec reprise séparée aux checkpoints `fight`, `upgrade` et `ending`, build, score, temps, pénalités et meilleur temps Forge conservés.
- Attribution de vingt-quatre `mechanicId` et de soixante-douze signatures d’état uniques aux boss Forge. Elles spécialisent huit familles socles enrichies et ne sont pas présentées comme vingt-quatre moteurs sans logique partagée.
- Instrumentation des 72/72 contrats de maîtrise Forge : les compteurs proviennent de la télémétrie de combat et aucune métrique inconnue ne réussit par défaut.
- Nouveau manifeste artistique 2.7.0 : 26 masters OpenAI de provenance vers 225 WebP runtime, dont 24 backdrops Forge et 96 pièces Forge.
- Correction du rig de Riva : corps unique sans torse doublé, semelles alignées sur le sol logique, bras-canon raccordé au socket et ombre de contact resserrée.
- Conservation du fallback Canvas, du chargement à la demande et de la séparation stricte entre le Circuit Forge et les six relais de campagne.
- Cette entrée décrit le contenu livré ; elle ne certifie ni QA matérielle, ni commit, ni push, ni déploiement public.

## 2.6.0 — Les trente machines

- Ajout d’une Forge séparée de la campagne : trente boss sélectionnables, quatre-vingt-dix phases et huit familles mécaniques pilotées par données.
- Intégration des profils 07–30 avec télégraphes, points faibles, valeurs propres, résultats, journal de Riva et progression de maîtrise sans modifier les six relais narratifs.
- Quatre planches OpenAI originales couvrent les 24 nouvelles silhouettes ; le manifeste immuable v2.6 publie 129 WebP et conserve un fallback procédural.
- Remplacement du rig composite de Riva par un corps OpenAI v4 cohérent et un bras-canon unique ; semelles alignées sur le sol logique et ombre de contact resserrée.
- Ajout des registres `boss-roster.js` et `expansion-story.js`, de la route `?mode=forge`, de la sélection 30 boss et des contrats de release correspondants.
- Nettoyage déterministe des fragments alpha entre cellules sans repeindre les sources générées.
- Chaîne PWA, serveur, cache Vercel, CI et build alignés sur la v2.6.

## 2.5.0 — Forge des machines

- Remplacement du membre avant de Riva par un avant-bras OpenAI dédié, sans épaule ni bras complet dupliqué ; le torse fournit le bras arrière et le canon reste le membre de tir.
- Nouveau runtime artistique immuable `assets/generated/v2.5.0/`, dérivé de 17 sources OpenAI et limité aux 103 WebP réellement consommés par le jeu.
- Synchronisation de l’introduction de combat : l’IA, les projectiles et le chronomètre restent arrêtés tant que la plaque d’introduction est visible.
- Ajout d’un contrat de forge pour étendre le Circuit à 30 machines originales, fondé sur des verbes de gameplay et sans reprendre noms, silhouettes ou assets d’une franchise tierce.
- Renforcement des contrats de non-régression pour le rig de Riva, l’introduction et la chaîne PWA v2.5.


## 2.4.0 — La dernière émission

- Ajout de `story.js`, registre narratif immuable pour l’intro, le prologue, six actes, six interludes, l’épilogue, les dossiers Codex et les contrats de maîtrise.
- Nouvelle ouverture : Cassian Voltério centralise les services civils des six districts dans la Couronne ; Riva Spark réactive la ligne manuelle M-0.
- Campagne structurée selon **Intro → Prologue → Boss → Résultat → Interlude → Atelier**, avec résolution finale après Crown Engine Ω.
- Chaque machine reçoit trois titres de phase, deux échanges de transformation, un journal de Riva, une conséquence de district et une restauration civile.
- Arc de campagne complété : Cassian entraîne sa Couronne sur les solutions de Riva ; Riva injecte une contre-phase M-0 avant la Citadelle.
- Épilogue clarifié : les six relais et leurs commandes locales sont restaurés, Cassian est détenu et Riva refuse une nouvelle centralisation.
- Vocabulaire corrigé pour distinguer les six relais de sécurité, les six infrastructures civiles et les onze modules d’amélioration disponibles.
- Sauvegarde v4 préparée pour séparer les victoires de campagne, les scènes découvertes, le Codex et les contrats de maîtrise des sessions d’entraînement.
- Le registre définit dix-huit contrats de maîtrise, trois par machine ; cette entrée ne certifie pas leur validation en navigateur.
- Ajout des surfaces narratives, des archives M-0 et des communications de phase dans l’interface responsive.
- Aucun statut de QA, commit, push ou déploiement n’est affirmé par cette entrée.

## 2.3.0 — Liberation Protocol

- Progression narrative structurée autour de Riva Spark, Cassian Voltério et des six districts reliés aux machines.
- Ajout d’un récapitulatif de campagne, d’une prochaine cible explicite et du hook de reprise `#continue-run`.
- Ajout du Codex complet avec dossiers de personnage, progression et six fiches de machine.
- Ajout d’un briefing de combat accessible : objectif permanent et conseils contextuels désactivables séparément.
- Pause enrichie avec objectif actif, build réel et rappel compact des commandes.
- Résultat enrichi avec journal de Riva, conséquence sur le district et configuration active.
- Prologue doté d’un itinéraire en six étapes ; épilogue doté d’un bilan des districts libérés.
- Intro boss resserrée dans une plaque contrastée sous le HUD ; briefing rendu lisible sur les fumées et fonds lumineux.
- Dimensions intrinsèques du key art alignées sur le fichier source 1672 × 941.
- États responsive, tactile, contraste renforcé et mouvement réduit étendus aux nouvelles surfaces.
- Les nouveaux IDs sont des hooks stables ; aucun ID historique n’est renommé.
- Aucun statut de QA, commit, push ou déploiement n’est affirmé par cette entrée.

## 2.2.0 — Illustrated Circuit

- Ajout d’un loader artistique optionnel, discret et accessible sur le titre/prologue, avec libellé annoncé et progression native.
- Définition d’un pipeline de 14 masters originaux produits avec OpenAI Image Generation intégré vers 103 assets runtime indépendants.
- Découpage prévu : 24 couches de parallaxe pour six arènes, 54 pièces transparentes pour six boss, neuf états de Riva Spark et seize VFX.
- Conservation du rendu procédural Canvas comme fallback si un asset manque ou échoue au chargement.
- Documentation du chargement progressif, du cache PWA et de la provenance originale des images.
- Renforcement responsive, contraste élevé et mouvement réduit pour l’indicateur de chargement.
- Aucun statut de QA, push GitHub ou déploiement Vercel n’est affirmé par cette entrée ; `QA_REPORT.md` reste réservé aux validations effectivement exécutées.

## 2.1.0 — Professional Circuit

- Transitions de phase verrouillées et chronométrage mural fiable.
- Navigation complète clavier/manette, pause tactile et HUD accessible.
- Prologue, progression de campagne et score rééquilibré.
- PWA installable, cache hors ligne, plein écran et identité visuelle originale.
- Build public minimal, en-têtes de sécurité, CI GitHub et tests serveur.

## 2.0.0

- Première campagne complète à six boss, améliorations et épilogue.
