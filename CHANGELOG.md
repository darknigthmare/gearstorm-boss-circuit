# Historique des versions

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
