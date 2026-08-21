"""Build independent runtime art from the OpenAI master sheets.

The image generator currently bakes its transparency preview into RGB pixels.
This deterministic post-process crops every requested cell, removes only the
large near-neutral checker components, and emits alpha WebP files plus a
content-addressed runtime manifest. It never paints or invents art.
"""

from __future__ import annotations

from collections import deque
from hashlib import sha256
from pathlib import Path
import json

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = ROOT / "assets" / "generated"
ASSET_RELEASE = "v2.6.0"
OUTPUT_ROOT = SOURCE_ROOT / ASSET_RELEASE
MANIFEST_PATH = OUTPUT_ROOT / "asset-manifest.json"

CORE_BOSSES = ("rammer", "kraken", "drill", "mantis", "cyclotron", "omega")
EXPANSION_BOSSES = (
    "bastion-ricochet", "hydraulic-warden", "hive-foreman", "echo-fencer", "breaker-array", "vertical-verdict",
    "rail-tyrant", "triplex-hunter", "ground-eater", "floodline-leviathan", "centrifuge-zero", "tempest-regulator",
    "ascension-frame", "counterforge", "carrier-cathedral", "twin-governors", "loadout-reactor", "orbital-famine",
    "logic-crucible", "vector-vault", "skyborne-battery", "endurance-engine", "adaptive-archivist", "null-crown",
)
BOSSES = CORE_BOSSES + EXPANSION_BOSSES
ARENA_LAYERS = ("far", "mid", "ground", "foreground")
BOSS_PARTS = {
    "rammer": ("wheel", "chassis", "ram", "hammer-left", "hammer-right", "rivet-pod", "mine-seismic", "core", "overdrive"),
    "kraken": ("fuselage", "cockpit", "wing-left", "wing-right", "tail-thruster", "ion-emitter", "bomb-pod", "laser-blades", "core"),
    "drill": ("carapace", "cockpit", "legs-front-left", "legs-front-right", "legs-rear", "magnetic-coil", "polarity-claws", "scrap-ring", "core"),
    "mantis": ("torso", "cockpit", "scythe-left", "scythe-right", "legs-left", "legs-right", "chrono-halo", "time-emitter", "core"),
    "cyclotron": ("furnace-torso", "cockpit", "piston-left", "piston-right", "leg-left", "leg-right", "stacks-hopper", "molten-core", "overarmor"),
    "omega": ("crown-hull", "throne-cockpit", "battery-left", "battery-right", "stabilizers", "blade-ring", "combined-arsenal", "omega-core", "ruptured-armor"),
}
HERO_PARTS = ("head", "torso", "arm-near", "arm-far", "legs", "boots", "pulse-cannon", "dash-trail", "overload-halo")
VFX = (
    "muzzle-cyan", "impact-metal", "shield-hit", "magnetic-spark",
    "smoke", "rivet-sparks", "electric-arcs", "molten-splash",
    "warning-pulse", "dash-shockwave", "overload-bloom", "chrono-fracture",
    "explosion-small", "explosion-core", "explosion-final", "scrap-glow",
)


def cell_box(size: tuple[int, int], columns: int, rows: int, index: int) -> tuple[int, int, int, int]:
    col, row = index % columns, index // columns
    width, height = size
    return (
        round(col * width / columns),
        round(row * height / rows),
        round((col + 1) * width / columns),
        round((row + 1) * height / rows),
    )


def checker_candidate(pixel: tuple[int, int, int]) -> bool:
    low, high = min(pixel), max(pixel)
    return low >= 218 and high - low <= 30


def extract_alpha(image: Image.Image) -> Image.Image:
    """Remove connected/large neutral checker regions while retaining highlights."""
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = list(rgb.get_flattened_data())
    candidate = bytearray(checker_candidate(pixel) for pixel in pixels)
    visited = bytearray(width * height)
    background = bytearray(width * height)

    def neighbours(index: int):
        x, y = index % width, index // width
        if x: yield index - 1
        if x + 1 < width: yield index + 1
        if y: yield index - width
        if y + 1 < height: yield index + width

    for start in range(width * height):
        if not candidate[start] or visited[start]:
            continue
        queue = deque([start])
        visited[start] = 1
        component: list[int] = []
        touches_edge = False
        while queue:
            index = queue.popleft()
            component.append(index)
            x, y = index % width, index // width
            touches_edge = touches_edge or x == 0 or y == 0 or x == width - 1 or y == height - 1
            for neighbour in neighbours(index):
                if candidate[neighbour] and not visited[neighbour]:
                    visited[neighbour] = 1
                    queue.append(neighbour)
        if touches_edge or len(component) >= 96:
            for index in component:
                background[index] = 1

    mask = Image.new("L", (width, height), 255)
    mask.putdata([0 if value else 255 for value in background])
    # A subtle blur removes the baked matte without softening the painted interior.
    mask = mask.filter(ImageFilter.GaussianBlur(0.55))
    rgba = rgb.convert("RGBA")
    rgba.putalpha(mask)
    return rgba


def save_runtime(image: Image.Image, relative_path: str, alpha: bool) -> dict:
    output = OUTPUT_ROOT / relative_path
    output.parent.mkdir(parents=True, exist_ok=True)
    if alpha:
        image.save(output, "WEBP", lossless=True, method=6)
    else:
        image.convert("RGB").save(output, "WEBP", quality=86, method=6)
    data = output.read_bytes()
    with Image.open(output) as check:
        width, height = check.size
        has_alpha = "A" in check.getbands()
    return {
        "src": f"assets/generated/{ASSET_RELEASE}/{relative_path}",
        "width": width,
        "height": height,
        "alpha": has_alpha,
        "bytes": len(data),
        "sha256": sha256(data).hexdigest(),
    }


def normalize_sprite(image: Image.Image, max_extent: int) -> Image.Image:
    """Extract a generated cutout and center it on the 418 px rig canvas."""
    rgba = extract_alpha(image)
    bounds = rgba.getbbox()
    if not bounds:
        raise ValueError("Generated sprite contains no visible pixels")
    crop = rgba.crop(bounds)
    crop.thumbnail((max_extent, max_extent), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (418, 418), (0, 0, 0, 0))
    position = ((418 - crop.width) // 2, (418 - crop.height) // 2)
    canvas.alpha_composite(crop, position)
    return canvas


def remove_alpha_islands(image: Image.Image, minimum_pixels: int) -> Image.Image:
    """Remove tiny disconnected crop spill without redrawing generated pixels."""
    rgba = image.convert("RGBA")
    width, height = rgba.size
    alpha = rgba.getchannel("A")
    alpha_pixels = alpha.load()
    visited = bytearray(width * height)
    discard: list[tuple[int, int]] = []

    for start_y in range(height):
        for start_x in range(width):
            start = start_y * width + start_x
            if visited[start] or alpha_pixels[start_x, start_y] <= 8:
                continue
            queue = deque([(start_x, start_y)])
            visited[start] = 1
            component: list[tuple[int, int]] = []
            while queue:
                x, y = queue.popleft()
                component.append((x, y))
                for neighbour_x, neighbour_y in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if not (0 <= neighbour_x < width and 0 <= neighbour_y < height):
                        continue
                    neighbour = neighbour_y * width + neighbour_x
                    if visited[neighbour] or alpha_pixels[neighbour_x, neighbour_y] <= 8:
                        continue
                    visited[neighbour] = 1
                    queue.append((neighbour_x, neighbour_y))
            if len(component) < minimum_pixels:
                discard.extend(component)

    if discard:
        for x, y in discard:
            alpha_pixels[x, y] = 0
        rgba.putalpha(alpha)
    return rgba


def source(path: Path) -> Image.Image:
    if not path.is_file():
        raise FileNotFoundError(path)
    return Image.open(path)


def main() -> None:
    manifest: dict = {
        "schemaVersion": 1,
        "release": "2.6.0",
        "generator": "OpenAI ImageGen built-in",
        "license": "Original project artwork",
        "arenas": {},
        "bosses": {},
        "heroine": {"id": "riva-spark", "parts": {}},
        "vfx": {},
    }

    for boss in CORE_BOSSES:
        master = source(SOURCE_ROOT / "arenas" / f"{boss}-parallax-openai-v1.png")
        layers = {}
        for index, layer in enumerate(ARENA_LAYERS):
            crop = master.crop(cell_box(master.size, 2, 2, index))
            alpha = index != 0
            runtime = extract_alpha(crop) if alpha else crop
            layers[layer] = save_runtime(runtime, f"arenas/{boss}/{layer}.webp", alpha)
        layers["far"]["speed"] = 0.015
        layers["mid"]["speed"] = 0.055
        layers["ground"]["speed"] = 0.12
        layers["foreground"]["speed"] = 0.19
        manifest["arenas"][boss] = {"layers": layers}

    for boss in CORE_BOSSES:
        master = source(SOURCE_ROOT / "bosses" / f"{boss}-parts-openai-v1.png")
        parts = {}
        for index, part in enumerate(BOSS_PARTS[boss]):
            crop = extract_alpha(master.crop(cell_box(master.size, 3, 3, index)))
            parts[part] = save_runtime(crop, f"bosses/{boss}/{part}.webp", True)
        manifest["bosses"][boss] = {"parts": parts}

    hero = source(SOURCE_ROOT / "riva" / "riva-parts-openai-v1.png")
    for index, part in enumerate(HERO_PARTS):
        crop = extract_alpha(hero.crop(cell_box(hero.size, 3, 3, index)))
        manifest["heroine"]["parts"][part] = save_runtime(crop, f"heroine/riva-spark/{part}.webp", True)

    # v4 replaces stacked anatomical fragments with a coherent body core and
    # one independent firing assembly. Legacy pieces remain as safe fallback.
    body_core = source(SOURCE_ROOT / "riva" / "riva-body-core-openai-v4.png")
    firing_arm = source(SOURCE_ROOT / "riva" / "riva-firing-arm-openai-v4.png")
    manifest["heroine"]["parts"]["body-core"] = save_runtime(
        normalize_sprite(body_core, 400),
        "heroine/riva-spark/body-core.webp",
        True,
    )
    manifest["heroine"]["parts"]["firing-arm"] = save_runtime(
        normalize_sprite(firing_arm, 370),
        "heroine/riva-spark/firing-arm.webp",
        True,
    )

    expansion_root = SOURCE_ROOT / "expansion-sources"
    for start in range(0, len(EXPANSION_BOSSES), 6):
        first = 7 + start
        last = first + 5
        master = source(expansion_root / f"bosses-{first:02d}-{last:02d}-source.png")
        for cell_index, boss_id in enumerate(EXPANSION_BOSSES[start:start + 6]):
            crop = master.crop(cell_box(master.size, 3, 2, cell_index))
            sprite = normalize_sprite(crop, 394)
            island_threshold = {
                "counterforge": 3_000,
                "loadout-reactor": 1_000,
                "hive-foreman": 200,
                "tempest-regulator": 35,
            }.get(boss_id, 250)
            sprite = remove_alpha_islands(sprite, island_threshold)
            manifest["bosses"][boss_id] = {
                "parts": {
                    "sprite": save_runtime(sprite, f"bosses/{boss_id}/sprite.webp", True)
                }
            }
    vfx = source(SOURCE_ROOT / "vfx" / "circuit-vfx-openai-v1.png")
    for index, effect in enumerate(VFX):
        crop = extract_alpha(vfx.crop(cell_box(vfx.size, 4, 4, index)))
        manifest["vfx"][effect] = save_runtime(crop, f"vfx/{effect}.webp", True)

    entries = []
    for arena in manifest["arenas"].values():
        entries.extend(arena["layers"].values())
    for boss in manifest["bosses"].values():
        entries.extend(boss["parts"].values())
    entries.extend(manifest["heroine"]["parts"].values())
    entries.extend(manifest["vfx"].values())
    manifest["summary"] = {
        "masters": 20,
        "runtimeFiles": len(entries),
        "arenaLayers": 24,
        "bossParts": 54 + len(EXPANSION_BOSSES),
        "heroineParts": len(manifest["heroine"]["parts"]),
        "vfx": 16,
        "totalBytes": sum(entry["bytes"] for entry in entries),
    }
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest["summary"], ensure_ascii=False))


if __name__ == "__main__":
    main()
