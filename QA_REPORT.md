# Rapport QA — GEARSTORM: Boss Circuit 2.3.0

Validation locale effectuée le 20 août 2026 sur le candidat de publication v2.3.0.

## Automatisation

- `npm run qa` : succès intégral, 32/32 tests réussis.
- Build v2.3.0 et `check-release` : réussis.
- `dist/` : 16 192 421 octets.
- Bibliothèque runtime : 103 WebP issus des assets v2.2.
- Audit des dépendances : 0 vulnérabilité.

## Parcours navigateur — ordinateur

Chrome headless local via CDP, viewport 1440 × 900 :

- campagne complète avec les six boss et leurs phases 1 à 3 ;
- cinq améliorations installées ;
- sauvegarde v3 et reprise de campagne confirmées après rechargement ;
- Codex complété à 6/6 ;
- routes `?mode=rush` et `?mode=practice` validées ;
- `getRigDiagnostics()` validé : pieds de Riva alignés à 36/36, six rigs de boss de neuf pièces, progression des pièces selon les phases et noyaux alignés ;
- 103/103 images chargées, 0 échec ;
- écran final atteint sans toast résiduel ;
- 0 erreur runtime et 0 erreur console.

## Parcours navigateur — mobile

Chrome local via CDP :

- portrait 390 × 844 : largeur du document égale au viewport, sept boutons visibles et briefing présent ;
- paysage 844 × 390 : largeur du document égale au viewport, sept boutons visibles et briefing présent ;
- 0 erreur runtime et 0 erreur console.

## Hors ligne

- service worker actif ;
- rechargement hors ligne réussi ;
- 103/103 images disponibles, 0 échec.

## Publication

Ce rapport couvre uniquement le candidat local. Les preuves GitHub et Vercel publiques seront collectées après le commit et le déploiement.

## Limites du passage

- Aucune manette physique n’a été testée.
- Aucun appareil tactile physique n’a été testé.
- Le navigateur intégré était bloqué par le helper ACL Windows ; les vérifications ont été exécutées dans Chrome local via CDP.
