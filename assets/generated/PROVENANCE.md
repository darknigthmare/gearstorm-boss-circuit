# GEARSTORM OpenAI art provenance

Generated on 2026-08-20 and extended on 2026-08-21 with the built-in OpenAI ImageGen tool for this original project. The 17 PNG source files beside this document are immutable production sources; `v2.5.0/` contains deterministic runtime crops produced by `scripts/process-openai-art.py`.

No franchise art, stock image, external logo, or third-party game asset was supplied as a source. The established GEARSTORM key art was used only as the project’s internal style direction.

## Master set

| Master | Prompt direction | Runtime output |
|---|---|---:|
| `arenas/rammer-parallax-openai-v1.png` | Rocade des Rivets: orange factory city, press gantries, steel highway, dust and sparks | 4 layers |
| `arenas/kraken-parallax-openai-v1.png` | Couloir des Hautes-Tensions: storm city, Tesla pylons, conductive runway, ion mist | 4 layers |
| `arenas/drill-parallax-openai-v1.png` | Fosse Ferromagnétique: violet cavern, electromagnets, rail arena, floating scrap | 4 layers |
| `arenas/mantis-parallax-openai-v1.png` | Horloge de la Faille: fractured clock district, gears, stable road, chronal shards | 4 layers |
| `arenas/cyclotron-parallax-openai-v1.png` | Fournaise des Pistons: blast furnaces, cranes, casting floor, heat and embers | 4 layers |
| `arenas/omega-parallax-openai-v1.png` | Citadelle Voltério: violet storm, crown fortress, throne platform, collapse energy | 4 layers |
| `bosses/rammer-parts-openai-v1.png` | Rivet Rex: wheel, chassis, ram, two hammers, launcher, mine plate, core, Overdrive | 9 parts |
| `bosses/kraken-parts-openai-v1.png` | Sky Slicer: fuselage, cockpit, two wings, tail, ion emitter, bombs, laser blades, core | 9 parts |
| `bosses/drill-parts-openai-v1.png` | Magnetron: carapace, sensor, leg banks, coil, claws, scrap ring, core | 9 parts |
| `bosses/mantis-parts-openai-v1.png` | Chrono Mantis: torso, head, scythes, leg banks, halo, emitter, core | 9 parts |
| `bosses/cyclotron-parts-openai-v1.png` | Foundry Titan: furnace, cockpit, piston arms, legs, stacks, molten core, overarmor | 9 parts |
| `bosses/omega-parts-openai-v1.png` | Crown Engine: crown hull, throne, batteries, stabilizers, blade ring, arsenal, core, rupture | 9 parts |
| `riva/riva-parts-openai-v1.png` | Riva Spark: head, torso, independent arms, legs, boots, cannon, dash, overload halo | 9 parts |
| `riva/riva-arm-near-openai-v2.png` | Full front-arm pose study matching Riva, retained as provenance and not published at runtime | 0 parts |
| `riva/riva-arm-far-openai-v2.png` | Full support-arm pose study matching Riva, retained as provenance and not published at runtime | 0 parts |
| `riva/riva-forearm-near-openai-v3.png` | Production forearm only: elbow coupling, short armored forearm and trigger glove, no shoulder or upper arm | 1 override |
| `vfx/circuit-vfx-openai-v1.png` | Cyan, orange, violet and chronal impacts, warnings, movement and explosions | 16 effects |

## Shared generation constraints

- Premium hand-painted comic side-scroller art with crisp silhouettes and upper-left lighting.
- Original dieselpunk/electropunk machinery; no text, logo, watermark, UI, copied character, or complete scene inside modular sheets.
- Strict grid placement with every requested component contained in its cell.
- Arena masters use one opaque far field plus three isolated parallax layers.
- Boss and heroine masters separate all moving modules; runtime hitboxes remain authored in code.

## Runtime derivation

The generator rendered a visual transparency checker into RGB masters. A direct ImageGen transparency edit was attempted, but the local image reference could not pass the sandbox reader. The deterministic processor therefore performs only these mechanical operations: crop the requested cells, remove large connected near-neutral checker regions, add feathered alpha, encode WebP, and record dimensions, byte size, and SHA-256. It does not repaint or invent pixels.

`assets/generated/v2.5.0/asset-manifest.json` is the runtime source of truth: 24 arena layers, 54 boss modules, 9 Riva modules, and 16 VFX files. The v3 forearm overrides only `heroine/riva-spark/arm-near.webp`; the two full-arm studies never enter the public bundle.
