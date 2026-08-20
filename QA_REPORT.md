# Rapport QA — GEARSTORM: Boss Circuit 2.2.0

Validation locale effectuée le 20 août 2026 sur le candidat de publication v2.2.0.

## Automatisation

- `npm run qa` : succès intégral.
- Syntaxe JavaScript : moteur, serveur, contrat d’assets, build et contrôle de release valides.
- Tests Node : 15/15 réussis.
- Catalogue visuel : 103 WebP vérifiés par dimensions, canal alpha, signature, taille et SHA-256.
- Inventaire : 24 couches d’arène, 54 pièces de boss, 9 pièces de Riva et 16 VFX ; 13 136 064 octets au total.
- Build 2.2 : seuls les 103 fichiers runtime, leur catalogue et le shell PWA sont copiés dans `dist/` ; aucun master OpenAI ni document interne n’est publié.
- Serveur HTTP : GET et HEAD validés ; 400, 404 et 405 contrôlés ; traversal, fichiers privés, masters et méthodes mutantes refusés.
- Cache : shell PWA versionné et cache runtime séparé pour les assets immuables `v2.2.0`.
- `npm audit --audit-level=high` : 0 vulnérabilité.

## Parcours navigateur — ordinateur

Chrome headless, viewport 1440 × 900 :

- menu et manifeste artistique v2.2 chargés sans erreur ;
- combat avec décor parallaxe quatre couches, Riva modulaire et Rivet Rex modulaire rendu sur le Canvas ;
- transition de phase 1 → 2 et surcharge capturées ;
- 103/103 images chargées au terme du Circuit, 0 échec ;
- aucune exception runtime, erreur ou alerte console.

## Parcours navigateur — mobile

- portrait émulé 390 × 844 : largeur document 390, aucun débordement horizontal, commandes tactiles visibles ;
- paysage émulé 844 × 390 : largeur document 844, Canvas et HUD lisibles ;
- les requêtes `prefers-reduced-motion`, contraste renforcé et contrôles grossiers restent prises en charge par le CSS ;
- aucun appareil tactile physique n’a été utilisé pendant ce passage.

## Campagne complète

Parcours QA sur `localhost` avec le hook réservé au développement :

- six boss chargés et vaincus dans une même campagne ;
- cinq améliorations installées entre les combats ;
- transformation de phase et surcharge déclenchées ;
- écran final et épilogue atteints ;
- tous les bundles d’arène, de boss, de Riva et de VFX chargés sans fallback forcé.

## Hors ligne

- service worker contrôlant la page après installation ;
- rechargement avec réseau coupé réussi ;
- manifeste v2.2 et 103/103 images récupérés du cache, 0 échec ;
- écran final et état de sauvegarde conservés.

## Publication

Ce rapport couvre le candidat local. La preuve GitHub, CI, Vercel READY, HTTP public et parcours sur l’alias de production est collectée après le commit signé par le hash de release ; elle ne doit pas être déduite de ce document avant publication.

## Limites du passage

- Aucune manette physique n’était connectée.
- Aucun appareil tactile physique n’a été testé.
- Le navigateur intégré était indisponible à cause du helper ACL Windows ; le parcours a été exécuté dans Chrome headless local via CDP.
