# Provenance — arènes Forge OpenAI v2.7

Les six masters de ce dossier ont été générés pour GEARSTORM avec OpenAI ImageGen le 21 août 2026. Ils sont conservés comme sources de production et exclus du bundle public.

## Contrat de génération

- Type : planches de quatre arènes originales, sans interface ni texte peint.
- Angle : décor de boss 2D de profil, composition 16:9, horizon stable et pont jouable dégagé.
- Style : dieselpunk/électropunk peint, éclairage cohérent avec le key art GEARSTORM.
- Sécurité gameplay : aucune silhouette de personnage, aucun projectile, aucune zone de télégraphe déjà peinte, plancher lisible.
- Propriété intellectuelle : aucun asset tiers, logo, personnage ou décor de franchise utilisé comme entrée ou demandé en sortie.
- Traitement : découpe mécanique de la cellule déclarée, cadrage 16:9 et encodage WebP ; aucune peinture générative ajoutée par le script.

## Masters réellement consommés

| Boss 07–30 | Fichier | Dimensions | SHA-256 |
|---|---|---:|---|
| Bastion Ricochet, Hydraulic Warden, Hive Foreman, Echo Fencer | `forge-arenas-07-10-openai-v1.png` | 1536 × 1024 | `5f0d792b52ef18924f3b5e77d8bfe95b676f61bea192e7d9657b7b019f1bd30f` |
| Breaker Array, Vertical Verdict, Rail Tyrant, Triplex Hunter | `forge-arenas-11-14-openai-v1.png` | 1448 × 1086 | `05385ecd9b765f6344869ced5875a8d73372739f957694763a2ce63ecbb3b511` |
| Ground Eater, Floodline Leviathan, Centrifuge Zero, Tempest Regulator | `forge-arenas-15-18-openai-v1.png` | 1536 × 1024 | `164e36f612d0a114c72746165d28403b80bdab8751b249a39e7672f24a346c69` |
| Ascension Frame, Counterforge, Carrier Cathedral, Twin Governors | `forge-arenas-19-22-openai-v1.png` | 1448 × 1086 | `c9cca3e0f0301537d8223e4e50b67e268d4a396d90ba240a9cce38b82e647a98` |
| Loadout Reactor, Orbital Famine, Logic Crucible, Vector Vault | `forge-arenas-23-26-openai-v1.png` | 1536 × 1024 | `6cecfe68229664a159330074358d137d52c9ce7e0791327705a2e300bec5262e` |
| Skyborne Battery, Endurance Engine, Adaptive Archivist, Null Crown | `forge-arenas-27-30-openai-v1.png` | 1536 × 1024 | `077a1b676e82ffc5b7e92f38757574ffe63975947b1f92a7f4f712d3d3d154c7` |

Les identifiants de prompt `forge-arenas-07-10-v1` à `forge-arenas-27-30-v1`, les dimensions, les octets et les hachages sont recopiés dans le catalogue immuable v2.7.0. Chaque cellule produit un backdrop WebP opaque 768 × 432 avec `groundY = 620` et `telegraphSafe = true`.

## Limites assumées

Ces vingt-quatre décors sont des backdrops monocouche. Ils donnent une identité propre à chaque combat tout en limitant la mémoire décodée, mais n’ont pas la profondeur des six arènes historiques à quatre plans parallaxes. Le fallback Canvas reste disponible si le chargement ou le cache échoue.
