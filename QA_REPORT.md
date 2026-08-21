# Rapport QA — GEARSTORM: Boss Circuit 2.6.0

Validation locale effectuée le 21 août 2026 sur le candidat v2.6.0.

## Automatisation

- `npm run qa` : succès intégral, 55/55 tests réussis.
- Build v2.6.0 et `check-release` : réussis.
- `dist/` : 20 364 880 octets.
- Registre : 30 boss jouables, 90 phases et 90 contrats de maîtrise déclarés.
- Bibliothèque runtime : 129 WebP v2.6.0, 17 088 342 octets, dérivés de 20 sources OpenAI documentées.
- `npm audit --audit-level=high` : 0 vulnérabilité.

## Parcours navigateur v2.6 — ordinateur

Chrome local via `agent-browser 0.34.0`, viewport 1440 × 900 :

- titre v2.6 et Forge intégrale chargés sans erreur console ;
- manifeste v2.6.0 prêt, 129/129 assets chargés et aucune ressource en échec ;
- 30 cartes Forge exactes et 24/24 boss étendus lancés en mode `fight`, avec leur ID, leur phase 1 et leur sprite OpenAI ;
- un représentant de chacune des huit familles a franchi la transition phase 1 → phase 2 ;
- Bastion Ricochet a confirmé la transition 150 → 100 PV ;
- Riva v4 a été inspectée en combat : silhouette complète, taille/buste/pelvis séparés, deux jambes lisibles et semelles alignées sur le plan du pont ;
- les statistiques de carte sont désormais séparées du descriptif, sans collision de texte.

Captures courantes :

- `qa-gearstorm-v26-browser/01-title-desktop.png` ;
- `qa-gearstorm-v26-browser/02-forge-grid-desktop.png` ;
- `qa-gearstorm-v26-browser/03-bastion-phase1-desktop.png` ;
- `qa-gearstorm-v26-browser/06-riva-ground-contact-desktop.png`.

## Mobile et accessibilité

- titre et Forge vérifiés à 390 × 844, sans débordement horizontal ;
- navigation, boutons et cartes restent entièrement accessibles par défilement ;
- audit axe de la Forge mobile : 0 violation confirmée ;
- 21 contrôles de contraste restent indéterminés automatiquement à cause des gradients et pseudo-éléments et ont donc été relus visuellement ;
- captures : `04-title-mobile-390x844.png` et `05-forge-mobile-390x844.png`.

## Gameplay, contenu et progression

- la campagne conserve ses six relais et reste distincte de la Forge ;
- le Laboratoire n’affiche que les six machines de campagne, tandis que la Forge expose les 30 profils ;
- les 24 boss étendus utilisent huit familles de contrôleurs data-driven, chacune avec télégraphes, boucle et trois phases ;
- histoire, objectifs, journaux et résultats Forge proviennent du registre narratif intégré ;
- 64/72 métriques de maîtrise Forge sont mesurées ; les huit mécaniques non instrumentées restent explicitement « NON ÉVALUÉE » et ne peuvent pas être acquises par défaut.

## Publication

Ce rapport couvre le candidat local. Les preuves GitHub, CI et Vercel publiques sont collectées après le commit et le déploiement.

## Limites du passage

- Les 24 boss Forge partagent huit familles de comportement et une arène procédurale ; ils ne possèdent pas encore chacun une IA, une arène et un rig multipartite uniques.
- Les 24 combats ont été lancés et leurs transitions de famille validées, mais leurs 72 phases n’ont pas toutes été terminées manuellement de bout en bout.
- Aucune manette physique, aucun appareil tactile physique et aucun lecteur d’écran réel n’ont été testés.
- Le navigateur intégré était bloqué par le helper ACL Windows ; le fallback autorisé a utilisé Chrome local avec `agent-browser`.
