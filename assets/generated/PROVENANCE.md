# GEARSTORM OpenAI art provenance

Generated on 2026-08-20 and extended through 2026-08-21 with the built-in OpenAI ImageGen tool for this original project. The v2.7 inventory contains 26 immutable PNG production masters. `assets/generated/v2.7.0/` contains deterministic runtime derivatives produced by `scripts/process-openai-art.py`.

No franchise art, stock image, external logo or third-party game asset was supplied as a source. The established GEARSTORM key art was used only as the project’s internal style direction.

## Master inventory

| Production family | Masters | Runtime output |
|---|---:|---:|
| Six historical arenas | 6 opaque parallax sheets | 24 WebP layers |
| Six historical bosses | 6 modular sheets | 54 WebP parts |
| Riva Spark | original sheet + body-core v4 + firing-arm v4 | 11 WebP parts |
| Combat VFX | 1 effect sheet | 16 WebP effects |
| Bosses Forge 07–30 | 4 OpenAI contact sheets | 96 WebP rig parts |
| Arenas Forge 07–30 | 6 OpenAI contact sheets | 24 WebP backdrops |
| **Total** | **26 masters** | **225 WebP** |

The exact file names, dimensions, byte sizes and SHA-256 digests are recorded in `assets/generated/v2.7.0/asset-manifest.json`. Boss sheets 07–30 are documented in `expansion-sources/PROVENANCE.md`; arena sheets 07–30 are documented in `forge-arena-sources/PROVENANCE.md`.

## Shared generation constraints

- Premium hand-painted side-scroller art with crisp silhouettes and coherent upper-left lighting.
- Original dieselpunk/electropunk machinery; no text, logo, watermark, UI or copied character.
- Strict contact-sheet placement with every requested machine or component contained in its cell.
- Gameplay-safe 16:9 arena composition, unobstructed floor band and readable telegraph zones.
- Boss and heroine hitboxes remain authored by the runtime rather than inferred from painted pixels.

## Runtime derivation

Some ImageGen source sheets contain a flattened transparency preview rather than native alpha. The deterministic processor performs mechanical segmentation only: crop declared cells, isolate connected subjects where needed, feather alpha edges, resize to the declared slot, encode WebP and record dimensions, byte size and SHA-256. It does not repaint or invent scene content.

Forge machines use four aligned runtime layers—chassis, weak core, left appendage and right appendage—derived from each source silhouette. Their pivots, joints, draw sizes and z-order are explicit in the v2.7 manifest. Forge arenas use one opaque 768 × 432 backdrop per machine; the six historical arenas retain four parallax layers.

The build copies only the 225 manifest-declared WebP files and the catalogue. All 26 PNG masters, prompts and production notes remain outside `dist/`.
