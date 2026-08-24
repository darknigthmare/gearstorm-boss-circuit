# Provenance — rig anatomique Riva Spark v2.9

Statut : **sources OpenAI intégrées au runtime v2.9**. Le personnage et les treize pièces anatomiques ont été générés le 24 août 2026 avec l’outil OpenAI ImageGen intégré. Riva Spark est une héroïne originale de GEARSTORM ; aucun sprite, modèle ou key art tiers n’a servi de source.

## Référence canonique

- `riva-canonical-openai-v1.png` — `riva-v2.9-canonical-v1` : vue complète trois-quarts vers la droite, queue-de-cheval cuivrée, armure graphite/cuivre, noyau cyan, avant-bras canon prothétique, appui au sol visible.

## Pièces indépendantes

- tête : `head-openai-v1.png` ;
- buste : `torso-openai-v1.png` ;
- bassin : `pelvis-openai-v1.png` ;
- bras arrière : `upper-arm-far-openai-v1.png`, `forearm-far-openai-v1.png` ;
- bras canon avant : `upper-arm-near-openai-v1.png`, `forearm-cannon-near-openai-v1.png` ;
- jambe arrière : `thigh-far-openai-v1.png`, `shin-far-openai-v1.png`, `boot-far-openai-v1.png` ;
- jambe avant : `thigh-near-openai-v1.png`, `shin-near-openai-v1.png`, `boot-near-openai-v1.png`.

Chaque appel a demandé une seule pièce isolée, sans corps complet, sans texte, logo, UI ou filigrane, avec connecteurs mécaniques propres et direction trois-quarts droite cohérente avec la référence canonique. Les fichiers sont des masters de provenance, pas des images runtime.

Le pipeline `scripts/process-openai-art.py` supprime le damier neutre, recadre l’alpha, normalise chaque pièce sur un canevas commun et publie treize WebP anatomiques indépendants. Les deux VFX (`dash-trail`, `overload-halo`) restent dérivés de la planche OpenAI historique. Le manifeste v2.9.1 porte pivots, articulations, ordre Z, limites alpha, couverture et SHA-256 ; les anciens composites `body-core` et `firing-arm` ne sont plus chargés.
