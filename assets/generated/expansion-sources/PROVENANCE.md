# Provenance — sources d’expansion des boss 07–30

Statut : **sources OpenAI intégrées au runtime v2.7**. Les quatre planches alimentent vingt-quatre rigs de quatre pièces, soit quatre-vingt-seize WebP transparents publiés sous `assets/generated/v2.7.0/bosses/`.

## Chaîne de production

- Date : 2026-08-21
- Générateur : OpenAI ImageGen built-in
- Intention : quatre planches 3 × 2 de machines GEARSTORM originales, une machine centrée par cellule, profil de combat trois-quarts
- Contrôle IP : aucun asset, logo, personnage ou modèle officiel fourni ; exclusions explicites contre les silhouettes et codes visuels reconnaissables d’une franchise existante
- Sortie du générateur : PNG RGB avec aperçu de transparence damier aplati
- Correction technique : `extract_alpha()`, normalisation 418 × 418 et suppression des petits îlots alpha déconnectés, sans peinture ni invention de pixels
- État runtime : intégré au manifeste immuable v2.7 ; quatre pièces alignées par boss, avec pivots, joints, z-order, noyau faible et fallback procédural

## Sources réellement consommées

| Plage | Fichier RGB | Dimensions | SHA-256 |
| --- | --- | --- | --- |
| 07–12 | `bosses-07-12-source.png` | 1536 × 1024 | `9e6d1f319a1678b2d5dbb5133109220893f89ba0d827526c32a1d725e8d8dd5a` |
| 13–18 | `bosses-13-18-source.png` | 1536 × 1024 | `68e430a484a9e534e814261a1660d6eb242e50d7b9585f13fecec1ae9b6eb7c1` |
| 19–24 | `bosses-19-24-source.png` | 1536 × 1024 | `aa474da74bf90ce205d7a4f3edb13f08c678c46afc60a70a354c005425981e60` |
| 25–30 | `bosses-25-30-source.png` | 1536 × 1024 | `0cc939597d5175ba0b4781d89ab6ba6b1ea0fa63cc7afa710ae279c4d7b4c4ae` |

Les variantes RGBA 07–12 et 13–18 ainsi que les tentatives intermédiaires sont conservées comme preuves de production. Le build public n’embarque ni ces PNG, ni les prompts, ni les masters : il copie seulement les 225 WebP v2.7 déclarés et le catalogue.

## Prompt final — boss 07–12

```text
Use case: stylized-concept
Asset type: native RGBA transparent source concept sheet for six original 2D boss-game machines
Primary request: create one clean 3-by-2 contact sheet containing exactly six distinct original industrial combat machines, one machine per invisible cell.
CRITICAL OUTPUT REQUIREMENT: export a PNG with a real alpha channel. Every pixel outside the six machine silhouettes must have alpha 0. Transparent means invisible RGBA pixels, NOT a gray/white checkerboard pattern, NOT a white backdrop, NOT a studio wall, NOT a floor. Do not draw or visualize transparency.
Subjects in reading order: 1) broad stationary ricochet bastion with three angular lightning-relay shields and faceted deflector plates; 2) squat hydraulic warden with two enormous independent press-jaw arms and visible pistons; 3) asymmetric micro-forge foreman with compact drone fabrication pods, gantry mechanisms, and protected energy core; 4) lean non-human echo duelist machine with long industrial lance, tuning-fork sensors, and recording discs; 5) modular breaker array with four clearly separate generator limbs surrounding a central exposed core; 6) vertical counterweight execution machine with pulleys, hanging masses, lift rails, and a heavy upper chassis.
Style: polished stylized mechanical game concept art, crisp painted 2.5D rendering, graphic silhouettes, cohesive retro-futurist GEARSTORM industrial world. Composition: exact 3 columns by 2 rows; one centered full machine per equal invisible cell; consistent scale; generous outer margins and gutters; no overlap; right-facing three-quarter combat profile; readable detachable parts. Palette: dark petrol steel, gunmetal, oxidized copper and brass, restrained cyan, amber, magenta, violet energy accents. Materials: riveted plates, repair seams, ceramics, cable bundles, tempered glass, worn painted metal; functional asymmetry.
Constraints: exactly six machines and nothing else; real transparent alpha outside silhouettes; no checkerboard; no text, labels, numbers, logo, UI, watermark, borders, scenery, ground plane, backdrop, cast-shadow plate, or cropped parts. All six designs original and visibly different in silhouette, locomotion, weapons, weak-point placement, and phase hardware.
Avoid any resemblance to an existing game franchise character, mascot, boss, robot, vehicle, level, or iconography; no hedgehog-like body or spikes, no egg-shaped cockpit or moustache motif, no white gloves, no red shoes, no golden rings, no multicolored gems, no checkerboard terrain, no recognizable copied silhouette.
```

## Prompt final — boss 13–18

```text
Use case: stylized-concept
Asset type: source concept sheet for six original 2D boss-game machines
Primary request: create one clean 3-by-2 contact sheet containing exactly six distinct original industrial combat machines, one machine per invisible cell.
Scene/backdrop: genuinely transparent alpha background across the whole image; no floor, no environment, no panel backgrounds, no grid lines.
Subjects in reading order:
1) a long armored rail tyrant machine, part locomotive and part mobile siege engine, with detachable couplers and a glowing drive core;
2) a low triplex pursuit skimmer with three clearly readable lane-guidance fins, lateral weapons, and a triangular sensor cluster;
3) a heavy demolition ground-eater with articulated crushing plates, deployable stabilizers, and visible construction machinery rather than an animal mouth;
4) an industrial floodline leviathan built from sluice gates, pressure tanks, pumps, pipes, and turbine fins, non-organic and non-animal;
5) a floating centrifuge-zero rotor machine composed of offset concentric rings, counterweights, and a vulnerable axis core;
6) a tall tempest regulator with wind turbines, lightning rods, heat exchangers, and three distinct weather-control modules.
Style/medium: polished stylized mechanical game concept art, crisp painted 2.5D rendering, graphic silhouettes, production-ready source art matching a cohesive retro-futurist GEARSTORM industrial world.
Composition/framing: exact 3 columns by 2 rows; every machine centered in its own equal cell; consistent apparent scale; full machine visible; generous outer margins and gutters; no overlap; dynamic right-facing three-quarter combat profile showing each machine's right side; readable detachable parts.
Lighting/mood: consistent cool studio key light with warm industrial rim light; energetic but neutral presentation.
Color palette: dark petrol steel, gunmetal, oxidized copper and brass, with restrained cyan, amber, magenta, and violet energy accents; each machine gets one dominant accent while remaining cohesive.
Materials/textures: riveted plates, repair seams, ceramics, cable bundles, tempered glass, worn painted metal; functional asymmetry.
Constraints: exactly six machines and no other objects; genuinely transparent background with preserved alpha; no text, labels, numbers, logo, UI, watermark, borders, scenery, ground plane, cast shadows beyond each silhouette, or cropped parts. All six designs must be original and visibly different in silhouette, locomotion, weapons, weak-point placement, and phase hardware.
Avoid: any resemblance to an existing video-game franchise character, mascot, boss, robot, vehicle, level, or iconography; no hedgehog-like body or spikes, no egg-shaped cockpit or moustache motif, no white gloves, no red shoes, no golden rings, no multicolored gems, no checkerboard terrain, no recognizable copied silhouette.
```

## Directions complémentaires — boss 19–30

Les deux dernières générations ont conservé le même contrat 3 × 2, le même profil trois-quarts, les mêmes matériaux industriels et les mêmes exclusions de propriété intellectuelle.

- 19–24 : Ascension Frame, Counterforge, Carrier Cathedral, Twin Governors, Loadout Reactor et Orbital Famine.
- 25–30 : Logic Crucible, Vector Vault, Skyborne Battery, Endurance Engine, Adaptive Archivist et Null Crown.
- Contraintes : six machines exactement par planche, silhouettes complètes séparées, aucun texte/logo/UI/décor, aucune silhouette ou iconographie reconnaissable d’une franchise existante, fond transparent demandé.
- Le PNG reçu étant RGB, la transparence publiée provient uniquement du traitement déterministe documenté ci-dessus.

## Limites de réutilisation

Les planches alimentent des rigs runtime en quatre couches segmentées : châssis, noyau faible et deux appendices. Pivots, joints, ordre de dessin et états de phase sont déclarés ; les pièces ne sont toutefois pas quatre générations natives séparées. Les backdrops dédiés sont documentés dans `../forge-arena-sources/PROVENANCE.md`.
