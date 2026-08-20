# Rapport QA — GEARSTORM: Boss Circuit 2.4.0

Validation locale effectuée le 21 août 2026 sur le candidat de publication v2.4.0.

## Automatisation

- `npm run qa` : succès intégral, 42/42 tests réussis.
- Build v2.4.0 et `check-release` : réussis.
- `dist/` : 16 252 244 octets.
- Bibliothèque runtime : 103 WebP versionnés issus des assets v2.2.
- Registre narratif : introduction, prologue, six actes, six interludes, épilogue et 18 contrats de maîtrise.
- `npm audit --audit-level=high` : 0 vulnérabilité.

## Parcours navigateur — ordinateur

Chrome headless local via CDP, profil vierge et viewport 1440 × 900 :

- parcours complet titre → introduction → prologue → six boss → cinq Ateliers → épilogue ;
- résultat, interlude, Codex, Laboratoire, pause et fin contrôlés visuellement ;
- libellés mécaniques chargés depuis `story.js`, dont les états de Foundry Titan ;
- panneaux Pause et Résultat mesurés à 700 px et 760 px ;
- Laboratoire validé séparément : « Simulation terminée », progression de campagne inchangée et « Rapport du Laboratoire » ;
- 21 captures de contrôle produites localement dans le dossier d’audit ignoré par Git et Vercel.

## Parcours navigateur — mobile

Chrome local via CDP :

- portrait 390 × 844 : introduction, prologue, combat, HUD, objectif, pause et sept commandes tactiles vérifiés ;
- paysage 844 × 390 : largeur du document égale au viewport, sept commandes visibles et objectif présent ;
- commandes portrait replacées en zone basse pour rester accessibles aux pouces ;
- aucun débordement horizontal détecté sur les deux orientations.

## Hors ligne

- service worker installé et contrôleur actif après amorçage en ligne ;
- rechargement du shell en réseau coupé réussi ;
- écran titre et surface QA de nouveau disponibles hors ligne.

## Publication

Ce rapport couvre le candidat local. Les preuves GitHub, CI et Vercel publiques sont collectées après le commit et le déploiement.

## Limites du passage

- Aucune manette physique n’a été testée.
- Aucun appareil tactile physique n’a été testé.
- Aucun lecteur d’écran réel n’a été testé.
- Le navigateur intégré était bloqué par le helper ACL Windows ; les vérifications ont été exécutées dans Chrome local via CDP.
