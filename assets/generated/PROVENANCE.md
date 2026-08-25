# GEARSTORM OpenAI art provenance

Generated from 2026-08-20 through 2026-08-25 with the built-in OpenAI ImageGen tool for this original project. The current v2.11 inventory contains 43 immutable PNG production masters. `assets/generated/v2.11.0/` contains deterministic runtime derivatives produced by `scripts/process-openai-art.py`.

No franchise art, stock image, external logo or third-party game asset was supplied as a source. The established GEARSTORM key art was used only as the project’s internal style direction.

## Current v2.11 inventory

| Production family | Masters | Runtime output |
|---|---:|---:|
| Six historical arenas | 6 opaque parallax sheets | 24 WebP layers |
| Six historical bosses | 6 modular sheets | 54 WebP parts |
| Bosses Forge 07–30 | 4 OpenAI contact sheets | 168 WebP rig parts |
| Arenas Forge 07–30 | 6 OpenAI contact sheets | 96 WebP parallax layers |
| Riva Spark | 1 historical sheet + canonical reference + 13 separate anatomy masters + 1 split reference | 14 anatomy parts + 2 effect layers |
| Combat VFX | 1 effect sheet | 16 WebP effects |
| Narrative scenes | 4 dedicated illustrations | 4 WebP scenes |
| **Total** | **43 masters** | **378 WebP** |

The manifest summary records 120 arena layers, 222 boss parts, 16 heroine assets, 16 shared VFX and 4 narrative scenes, totaling 39,212,378 runtime bytes. Exact file names, dimensions, alpha flags, byte sizes and SHA-256 digests are recorded in `assets/generated/v2.11.0/asset-manifest.json`.

Boss sheets 07–30 are documented in `expansion-sources/PROVENANCE.md`; arena sheets 07–30 in `forge-arena-sources/PROVENANCE.md`; Riva’s separated sources in `riva-v2.9-sources/PROVENANCE.md` and its v2.11 split reference in `riva-v2.11-sources/`; narrative sources in `narrative-v2.9-sources/PROVENANCE.md`.

## Shared generation constraints

- Premium hand-painted side-scroller art with crisp silhouettes and coherent upper-left lighting.
- Original dieselpunk/electropunk machinery; no text, logo, watermark, UI or copied character.
- Strict contact-sheet placement with every requested machine or component contained in its cell.
- Gameplay-safe 16:9 arena composition, unobstructed floor band and readable telegraph zones.
- Boss and heroine hitboxes remain authored by the runtime rather than inferred from painted pixels.

## Riva native rig contract

The runtime rig uses 14 independent anatomy parts: head, torso, pelvis, near/far upper arms, near/far forearms, an independent near cannon, near/far thighs, near/far shins and near/far boots. Dash trail and overload halo are separate effect layers, bringing the heroine category to 16 files.

The renderer applies `rootOffsetY = -71`. The deterministic asset contract measures the lower alpha union of the boots at `feetLocalY = 36`; the physical ground remains `groundY = 620`. This is an image-derived contact check, not a hitbox inferred from the artwork.

## Arena perspective contract

The six four-layer campaign arenas declare `visualOffsetY = 80`. The 24 four-layer Forge arenas declare `visualOffsetY = 28`. These offsets align painted road surfaces with Riva while leaving physical ground, collisions and telegraph coordinates unchanged.

## Runtime derivation

Some ImageGen source sheets contain a flattened transparency preview rather than native alpha. The deterministic processor performs mechanical segmentation only: crop declared cells, isolate connected subjects where needed, feather alpha edges, resize to the declared slot, encode WebP and record dimensions, byte size and SHA-256. It does not repaint or invent scene content.

Forge machines use seven aligned runtime layers—chassis, armor shell, weak core and two articulated appendages in two segments—derived from each source silhouette. Their parents, pivots, joints, draw sizes, z-order and motion profiles are explicit in the v2.11 manifest. Forge arenas use four 768 × 432 parallax layers per machine; the six historical arenas retain their four layers.

The build contract copies only the 378 manifest-declared WebP files and the catalogue. All 43 PNG masters, prompts and production notes remain outside `dist/`.

## Historical v2.7 inventory

The preserved v2.7 manifest contains 26 masters and 225 WebP runtime files. Its Riva body-core/firing-arm composite and its original byte total remain historical evidence, not the current runtime contract. The v2.9 manifest supersedes it without deleting the documented source lineage.
