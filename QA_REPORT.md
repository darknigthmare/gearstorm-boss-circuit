# Rapport QA — GEARSTORM: Boss Circuit 2.1.0

Validation locale effectuée le 20 août 2026 sur le candidat de publication.

## Automatisation

- `npm run qa` : succès intégral.
- Syntaxe JavaScript : `game.js`, `server.js`, le build et le contrôle de release sont valides.
- Tests Node : 10/10 réussis.
- Serveur HTTP : GET et HEAD validés ; 400, 404 et 405 contrôlés ; traversal, fichiers privés et méthodes mutantes refusés.
- Build 2.1 : `dist/` généré avec uniquement le runtime web, les assets PWA et le manifeste d’intégrité SHA-256.
- Contrôle de release : manifeste, service worker, icônes, key art, en-têtes de sécurité et configuration Vercel validés.
- `npm audit` : 0 vulnérabilité.

## Production Vercel

- Alias public : https://gearstorm-boss-circuit.vercel.app
- Déploiement de production confirmé READY.
- Page, manifeste, moteur et key art : HTTP 200 avec les en-têtes de sécurité attendus.
- Tests et documentation internes : HTTP 404, donc absents du bundle public.
- Parcours navigateur en production : menu, prologue, combat et pause validés, sans erreur runtime.
- Service worker actif en production ; le hook QA reste absent hors localhost.

## Parcours navigateur — ordinateur

Viewport 1440 × 900 :

- key art, menu principal et prologue visuellement validés ;
- lancement du combat et pause validés ;
- aucune erreur enregistrée dans la console.

## Parcours navigateur — mobile

Viewport émulé 390 × 844 :

- titre et composition visuelle validés après correction responsive ;
- aucun débordement horizontal ;
- prologue, commandes tactiles et pause tactile validés ;
- options et volume conservés après rechargement.

## Campagne complète

Parcours QA sur `localhost` :

- transitions de phases 1 → 2 → 3 confirmées ;
- six boss vaincus dans une même campagne ;
- cinq améliorations installées et conservées ;
- écran final et épilogue atteints ;
- sauvegarde finale confirmée avec `completed=true` et `unlocked=6`.

## Accessibilité

- axe-core 4.12.1 : 0 violation détectée.
- Le contraste du texte posé sur le key art est signalé comme contrôle incomplet par l’outil et a donc été conservé en revue visuelle manuelle.

## Limites du passage

- Aucune manette physique n’était connectée.
- Le parcours mobile utilisait une émulation de viewport ; aucun appareil tactile physique n’a été testé.
