# Rapport QA — GEARSTORM: Boss Circuit 2.5.0

Validation locale effectuée le 21 août 2026 sur le candidat v2.5.0.

## Automatisation

- `npm run qa` : succès intégral, 44/44 tests réussis.
- Build v2.5.0 et `check-release` : réussis.
- `dist/` : 16 233 987 octets.
- Bibliothèque runtime : 103 WebP v2.5.0, 13 113 368 octets, dérivés de 17 sources OpenAI documentées.
- Registre narratif : introduction, prologue, six actes, six interludes, épilogue et 18 contrats de maîtrise.
- `npm audit --audit-level=high` : 0 vulnérabilité.

## Parcours navigateur v2.5 — ordinateur

Chrome local via CDP, viewport 1440 × 900 et DPR 2 pour le combat :

- parcours titre → introduction → prologue → Rivet Rex confirmé avec le manifeste v2.5.0 ;
- `art.ready = true`, liste d’échecs vide et 103 assets déclarés ;
- silhouette de Riva inspectée plein cadre puis en agrandissement : deux membres lisibles, aucun troisième bras, avant-bras flottant, coude surnuméraire ou chevauchement grotesque ;
- le torse fournit le bras arrière, `arm-near:openai-v3` l’avant-bras de tir et `pulse-cannon` le canon ;
- titre et prologue contrôlés à 1440 × 900 : pas de débordement, recadrage, CTA masqué ni texte illisible ;
- captures courantes : `audit-visual-v2.5/accepted-jpg/01-riva-combat.jpg`, `04-title-desktop.jpg` et `05-prologue-desktop.jpg`.

## Corrections responsive et accessibilité

- les communications portrait sont placées après le canvas afin de ne plus masquer Riva, le sol ou un télégraphe ;
- l’objectif paysage compact est recentré en haut et son aide secondaire est masquée ;
- les toasts évitent désormais les commandes tactiles en portrait et paysage ;
- la route du prologue reste visible sous 480 px ;
- radio, HUD, commandes tactiles, toast et conseil d’orientation reçoivent le contraste renforcé ;
- les écrans inactifs deviennent `inert` et `aria-hidden`, avec restauration du focus sur l’écran actif.

## Gameplay et progression

- l’introduction bloque maintenant l’IA, les tirs et le chronomètre jusqu’à disparition réelle de la plaque, y compris après pause ;
- une victoire en Laboratoire ne débloque plus la machine suivante et ne modifie pas la progression de campagne ;
- lancer un nouveau Circuit avec une reprise valide exige une confirmation explicite.

## Publication

Ce rapport couvre le candidat local. Les preuves GitHub, CI et Vercel publiques sont collectées après le commit et le déploiement.

## Limites du passage

- La nouvelle capture mobile paysage et la nouvelle capture Résultat n’ont pas été produites : Chrome/CDP s’est suspendu pendant ces deux parcours et l’instance locale a été arrêtée proprement.
- La campagne complète des six boss n’a pas été rejouée manuellement après les changements v2.5 ; les contrats automatisés et le parcours ciblé couvrent cette passe.
- Aucune manette physique, aucun appareil tactile physique et aucun lecteur d’écran réel n’ont été testés.
- Le navigateur intégré est resté bloqué par le helper ACL Windows ; les vérifications visuelles réussies ont été exécutées dans Chrome local via CDP.
