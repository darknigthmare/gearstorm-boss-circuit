# Provenance — scènes narratives OpenAI v2.9

Statut : **sources OpenAI intégrées au runtime v2.9**. Ces quatre masters originaux ont été générés le 24 août 2026 avec l’outil OpenAI ImageGen intégré, uniquement pour GEARSTORM. Ils ne reprennent aucun personnage, logo, key art ou élément d’une franchise existante.

## Masters retenus

- `intro-broadcast-openai-v1.png` — `gearstorm-narrative-intro-broadcast-v1` : Riva découvre la ligne de maintenance M-0 pendant qu’une silhouette de diffusion abstraite domine le Circuit verrouillé.
- `prologue-m0-openai-v1.png` — `gearstorm-narrative-prologue-m0-v1` : Riva marche sur une vraie voie de service vers les six relais civils allumés.
- `campaign-ending-openai-v1.png` — `gearstorm-narrative-campaign-ending-v1` : l’aube revient sur les six districts, les équipes locales reprennent les relais et la Couronne neutralisée reste à l’écart.
- `forge-ending-openai-v1.png` — `gearstorm-narrative-forge-ending-v1` : Riva et les équipes civiques répartissent les clés d’urgence autour du Trône Zéro désactivé.

## Contraintes communes

- illustration cinématique 2D originale, format paysage 16:9 et angle cohérent avec un jeu d’action latéral ;
- Riva Spark reste identifiable par sa queue-de-cheval cuivrée, son armure graphite/cuivre, son noyau cyan et son avant-bras canon prothétique ;
- aucun texte peint, logo, UI, filigrane, collage ou fausse capture d’écran ;
- composition lisible derrière les panneaux UI, avec silhouettes principales placées hors des zones de texte critiques ;
- aucun emprunt visuel à Sonic, Mega Man ou une autre licence.

Le pipeline `scripts/process-openai-art.py` normalise ces masters en quatre WebP opaques sous `assets/generated/v2.9.1/narrative/`. Les dimensions, tailles, identifiants de prompt et SHA-256 sont consignés dans le manifeste v2.9.1 ; les PNG sources ne sont jamais servis par le serveur de production.
