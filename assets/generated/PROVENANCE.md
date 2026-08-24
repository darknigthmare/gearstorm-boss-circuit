# GEARSTORM OpenAI art provenance

Generated from 2026-08-20 through 2026-08-24 with the built-in OpenAI ImageGen tool for this original project. The current v2.9 inventory contains 42 immutable PNG production masters. `assets/generated/v2.9.1/` contains deterministic runtime derivatives produced by `scripts/process-openai-art.py`.

No franchise art, stock image, external logo or third-party game asset was supplied as a source. The established GEARSTORM key art was used only as the project’s internal style direction.

## Current v2.9 inventory

| Production family | Masters | Runtime output |
|---|---:|---:|
| Six historical arenas | 6 opaque parallax sheets | 24 WebP layers |
| Six historical bosses | 6 modular sheets | 54 WebP parts |
| Bosses Forge 07–30 | 4 OpenAI contact sheets | 96 WebP rig parts |
| Arenas Forge 07–30 | 6 OpenAI contact sheets | 24 WebP backdrops |
| Riva Spark | 1 historical sheet + canonical reference + 13 separate anatomy masters | 13 anatomy parts + 2 effect layers |
| Combat VFX | 1 effect sheet | 16 WebP effects |
| Narrative scenes | 4 dedicated illustrations | 4 WebP scenes |
| **Total** | **42 masters** | **233 WebP** |

The manifest summary records 48 arena assets, 150 boss parts, 15 heroine assets, 16 shared VFX and 4 narrative scenes, totaling 18,175,510 runtime bytes. Exact file names, dimensions, alpha flags, byte sizes and SHA-256 digests are recorded in `assets/generated/v2.9.1/asset-manifest.json`.

Boss sheets 07–30 are documented in `expansion-sources/PROVENANCE.md`; arena sheets 07–30 in `forge-arena-sources/PROVENANCE.md`; Riva’s new separated sources in `riva-v2.9-sources/PROVENANCE.md`; narrative sources in `narrative-v2.9-sources/PROVENANCE.md`.

## Shared generation constraints

- Premium hand-painted side-scroller art with crisp silhouettes and coherent upper-left lighting.
- Original dieselpunk/electropunk machinery; no text, logo, watermark, UI or copied character.
- Strict contact-sheet placement with every requested machine or component contained in its cell.
- Gameplay-safe 16:9 arena composition, unobstructed floor band and readable telegraph zones.
- Boss and heroine hitboxes remain authored by the runtime rather than inferred from painted pixels.

## Riva native rig contract

The runtime rig uses 13 independent anatomy parts: head, torso, pelvis, near/far upper arms, near/far forearms (including the cannon), near/far thighs, near/far shins and near/far boots. Dash trail and overload halo are separate effect layers, bringing the heroine category to 15 files.

The renderer applies `rootOffsetY = -23.6`. The deterministic asset contract measures the lower alpha union of the boots at `feetLocalY = 36`; the physical ground remains `groundY = 620`. This is an image-derived contact check, not a hitbox inferred from the artwork.

## Arena perspective contract

The six four-layer campaign arenas declare `visualOffsetY = 80`. The 24 single-layer Forge backdrops declare `visualOffsetY = 28`. These offsets align painted road surfaces with Riva while leaving physical ground, collisions and telegraph coordinates unchanged.

## Runtime derivation

Some ImageGen source sheets contain a flattened transparency preview rather than native alpha. The deterministic processor performs mechanical segmentation only: crop declared cells, isolate connected subjects where needed, feather alpha edges, resize to the declared slot, encode WebP and record dimensions, byte size and SHA-256. It does not repaint or invent scene content.

Forge machines use four aligned runtime layers—chassis, weak core, left appendage and right appendage—derived from each source silhouette. Their pivots, joints, draw sizes and z-order are explicit in the v2.9 manifest. Forge arenas use one opaque 768 × 432 backdrop per machine; the six historical arenas retain four parallax layers.

The build contract copies only the 233 manifest-declared WebP files and the catalogue. All 42 PNG masters, prompts and production notes remain outside `dist/`.

## Historical v2.7 inventory

The preserved v2.7 manifest contains 26 masters and 225 WebP runtime files. Its Riva body-core/firing-arm composite and its original byte total remain historical evidence, not the current runtime contract. The v2.9 manifest supersedes it without deleting the documented source lineage.
