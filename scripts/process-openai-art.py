"""Build independent runtime art from the OpenAI master sheets.

The deterministic post-process removes baked checker previews, crops the six
OpenAI Forge arena atlases into 24 gameplay backdrops, and splits each existing
OpenAI expansion boss sprite into four independently drawable rig layers. It
never paints or invents source pixels.
"""

from __future__ import annotations

from collections import deque
from hashlib import sha256
from pathlib import Path
import json

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = ROOT / "assets" / "generated"
ASSET_RELEASE = "v2.7.0"
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
EXPANSION_PARTS = ("chassis", "core", "appendage-left", "appendage-right")
EXPANSION_DRAW_SIZE = {"width": 236, "height": 236}
EXPANSION_ARENA_SHEETS = ((7, 10), (11, 14), (15, 18), (19, 22), (23, 26), (27, 30))
EXPANSION_WEAK_CORES = {
    "bastion-ricochet": (0.50, 0.51, 0.105), "hydraulic-warden": (0.46, 0.50, 0.095),
    "hive-foreman": (0.55, 0.48, 0.105), "echo-fencer": (0.46, 0.43, 0.090),
    "breaker-array": (0.50, 0.50, 0.105), "vertical-verdict": (0.50, 0.36, 0.090),
    "rail-tyrant": (0.50, 0.51, 0.095), "triplex-hunter": (0.56, 0.55, 0.090),
    "ground-eater": (0.48, 0.55, 0.100), "floodline-leviathan": (0.51, 0.55, 0.100),
    "centrifuge-zero": (0.53, 0.50, 0.100), "tempest-regulator": (0.52, 0.52, 0.095),
    "ascension-frame": (0.51, 0.48, 0.095), "counterforge": (0.55, 0.50, 0.095),
    "carrier-cathedral": (0.50, 0.52, 0.100), "twin-governors": (0.50, 0.49, 0.095),
    "loadout-reactor": (0.50, 0.55, 0.105), "orbital-famine": (0.55, 0.52, 0.100),
    "logic-crucible": (0.50, 0.56, 0.105), "vector-vault": (0.50, 0.54, 0.105),
    "skyborne-battery": (0.48, 0.50, 0.095), "endurance-engine": (0.50, 0.50, 0.100),
    "adaptive-archivist": (0.52, 0.55, 0.095), "null-crown": (0.50, 0.57, 0.115),
}


def cell_box(size: tuple[int, int], columns: int, rows: int, index: int) -> tuple[int, int, int, int]:
    col, row = index % columns, index // columns
    width, height = size
    return (
        round(col * width / columns), round(row * height / rows),
        round((col + 1) * width / columns), round((row + 1) * height / rows),
    )


def checker_candidate(pixel: tuple[int, int, int]) -> bool:
    low, high = min(pixel), max(pixel)
    return low >= 218 and high - low <= 30


def extract_alpha(image: Image.Image) -> Image.Image:
    """Remove connected neutral checker regions while retaining painted highlights."""
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = list(rgb.get_flattened_data())
    candidate = bytearray(checker_candidate(pixel) for pixel in pixels)
    visited = bytearray(width * height)
    background = bytearray(width * height)

    def neighbours(index: int):
        x, y = index % width, index // width
        if x:
            yield index - 1
        if x + 1 < width:
            yield index + 1
        if y:
            yield index - width
        if y + 1 < height:
            yield index + width

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
    mask = mask.filter(ImageFilter.GaussianBlur(0.55))
    rgba = rgb.convert("RGBA")
    rgba.putalpha(mask)
    return rgba


def save_runtime(image: Image.Image, relative_path: str, alpha: bool, quality: int = 86) -> dict:
    output = OUTPUT_ROOT / relative_path
    output.parent.mkdir(parents=True, exist_ok=True)
    if alpha:
        image.save(output, "WEBP", lossless=True, method=6)
    else:
        image.convert("RGB").save(output, "WEBP", quality=quality, method=6)
    data = output.read_bytes()
    with Image.open(output) as check:
        width, height = check.size
        has_alpha = "A" in check.getbands()
    return {
        "src": f"assets/generated/{ASSET_RELEASE}/{relative_path}",
        "width": width, "height": height, "alpha": has_alpha,
        "bytes": len(data), "sha256": sha256(data).hexdigest(),
    }


def normalize_sprite(image: Image.Image, max_extent: int) -> Image.Image:
    rgba = extract_alpha(image)
    bounds = rgba.getbbox()
    if not bounds:
        raise ValueError("Generated sprite contains no visible pixels")
    crop = rgba.crop(bounds)
    crop.thumbnail((max_extent, max_extent), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (418, 418), (0, 0, 0, 0))
    canvas.alpha_composite(crop, ((418 - crop.width) // 2, (418 - crop.height) // 2))
    return canvas


def remove_alpha_islands(image: Image.Image, minimum_pixels: int) -> Image.Image:
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

    for x, y in discard:
        alpha_pixels[x, y] = 0
    rgba.putalpha(alpha)
    return rgba


def source(path: Path) -> Image.Image:
    if not path.is_file():
        raise FileNotFoundError(path)
    return Image.open(path)


def source_record(path: Path, prompt_id: str | None = None) -> dict:
    data = path.read_bytes()
    with Image.open(path) as image:
        width, height = image.size
    record = {
        "file": path.relative_to(ROOT).as_posix(), "width": width, "height": height,
        "bytes": len(data), "sha256": sha256(data).hexdigest(),
    }
    if prompt_id:
        record["promptId"] = prompt_id
    return record


def find_floor_line(image: Image.Image) -> int:
    """Find the strongest broad horizontal platform edge in the lower playfield."""
    gray = image.convert("L").resize((256, image.height), Image.Resampling.BILINEAR)
    pixels = gray.load()
    start = round(image.height * 0.66)
    stop = min(image.height - 4, round(image.height * 0.94))
    scores = []
    for y in range(start, stop):
        edge = sum(abs(pixels[x, y + 2] - pixels[x, y - 2]) for x in range(256)) / 256
        continuity = sum(1 for x in range(256) if abs(pixels[x, y + 2] - pixels[x, y - 2]) > 18) / 256
        scores.append((edge + continuity * 18, y))
    return max(scores)[1]


def normalize_arena_backdrop(master: Image.Image, index: int) -> tuple[Image.Image, dict]:
    raw_box = cell_box(master.size, 2, 2, index)
    cell = master.crop(raw_box).convert("RGB")
    inset = max(3, round(min(cell.size) * 0.008))
    cell = cell.crop((inset, inset, cell.width - inset, cell.height - inset))
    floor_y = find_floor_line(cell)
    target_height = round(cell.width * 9 / 16)
    if target_height > cell.height:
        target_width = round(cell.height * 16 / 9)
        left = (cell.width - target_width) // 2
        cell = cell.crop((left, 0, left + target_width, cell.height))
        floor_y = find_floor_line(cell)
        target_height = cell.height
    desired_floor = round(target_height * 620 / 720)
    top = max(0, min(cell.height - target_height, floor_y - desired_floor))
    crop = cell.crop((0, top, cell.width, top + target_height))
    runtime = crop.resize((768, 432), Image.Resampling.LANCZOS)
    return runtime, {
        "atlasCell": index,
        "sourceBox": {"x": raw_box[0], "y": raw_box[1], "width": raw_box[2] - raw_box[0], "height": raw_box[3] - raw_box[1]},
        "crop": {"x": inset, "y": inset + top, "width": cell.width, "height": target_height},
    }


def snap_weak_core(sprite: Image.Image, hint: tuple[float, float, float]) -> tuple[int, int, int]:
    rgba = sprite.convert("RGBA")
    pixels = rgba.load()
    cx, cy = round(hint[0] * 417), round(hint[1] * 417)
    search = 70
    best = None
    for y in range(max(0, cy - search), min(418, cy + search + 1)):
        for x in range(max(0, cx - search), min(418, cx + search + 1)):
            r, g, b, a = pixels[x, y]
            if a <= 16:
                continue
            distance = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            luminance = (r + g + b) / 3
            chroma = max(r, g, b) - min(r, g, b)
            score = luminance * 0.48 + chroma * 0.78 - distance * 1.25
            if best is None or score > best[0]:
                best = (score, x, y)
    if best:
        cx, cy = best[1], best[2]
    return cx, cy, max(28, round(hint[2] * 418))


def split_expansion_sprite(sprite: Image.Image, hint: tuple[float, float, float]) -> tuple[dict[str, Image.Image], dict]:
    """Partition all visible pixels into semantic, independently drawable layers."""
    rgba = sprite.convert("RGBA")
    alpha = rgba.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        raise ValueError("Expansion sprite contains no visible pixels")
    left, top, right, bottom = bounds
    width, height = right - left, bottom - top
    middle_x = (left + right) / 2
    center_band = width * 0.13
    base_y = top + height * 0.72
    core_x, core_y, core_radius = snap_weak_core(rgba, hint)
    masks = {name: Image.new("L", rgba.size, 0) for name in EXPANSION_PARTS}
    writers = {name: mask.load() for name, mask in masks.items()}
    source_alpha = alpha.load()
    counts = {name: 0 for name in EXPANSION_PARTS}

    for y in range(rgba.height):
        for x in range(rgba.width):
            value = source_alpha[x, y]
            if value <= 0:
                continue
            if (x - core_x) ** 2 + (y - core_y) ** 2 <= core_radius ** 2:
                part = "core"
            elif y >= base_y or abs(x - middle_x) <= center_band:
                part = "chassis"
            elif x < middle_x:
                part = "appendage-left"
            else:
                part = "appendage-right"
            writers[part][x, y] = value
            counts[part] += 1

    if min(counts.values()) < 64:
        raise ValueError(f"Rig partition too small: {counts}")
    layers = {}
    for name, mask in masks.items():
        layer = rgba.copy()
        layer.putalpha(mask)
        layers[name] = layer
    rig = {
        "canvas": {"width": 418, "height": 418},
        "origin": {"x": 0.5, "y": 0.5},
        "drawSize": dict(EXPANSION_DRAW_SIZE),
        "weakCore": {
            "part": "core", "x": round(core_x / 417, 4), "y": round(core_y / 417, 4),
            "radius": round(core_radius / 418, 4),
        },
        "coveragePixels": counts,
    }
    return layers, rig


def part_metadata(name: str, rig: dict) -> dict:
    weak = rig["weakCore"]
    metadata = {
        "role": {"chassis": "chassis", "core": "weak-core", "appendage-left": "appendage", "appendage-right": "appendage"}[name],
        "pivot": {"x": 0.5, "y": 0.5},
        "joint": {"x": 0.5, "y": 0.58},
        "z": {"chassis": 0, "appendage-left": 1, "appendage-right": 1, "core": 2}[name],
        "drawSize": dict(EXPANSION_DRAW_SIZE),
    }
    if name == "core":
        metadata["joint"] = {"x": weak["x"], "y": weak["y"]}
        metadata["weakCore"] = True
    elif name == "appendage-left":
        metadata["joint"] = {"x": 0.38, "y": 0.52}
        metadata["side"] = "left"
    elif name == "appendage-right":
        metadata["joint"] = {"x": 0.62, "y": 0.52}
        metadata["side"] = "right"
    return metadata


def master_inventory() -> list[dict]:
    records = []
    for boss in CORE_BOSSES:
        records.append(source_record(SOURCE_ROOT / "arenas" / f"{boss}-parallax-openai-v1.png"))
        records.append(source_record(SOURCE_ROOT / "bosses" / f"{boss}-parts-openai-v1.png"))
    for name in ("riva-parts-openai-v1.png", "riva-body-core-openai-v4.png", "riva-firing-arm-openai-v4.png"):
        records.append(source_record(SOURCE_ROOT / "riva" / name))
    records.append(source_record(SOURCE_ROOT / "vfx" / "circuit-vfx-openai-v1.png"))
    for first in (7, 13, 19, 25):
        records.append(source_record(SOURCE_ROOT / "expansion-sources" / f"bosses-{first:02d}-{first + 5:02d}-source.png"))
    for first, last in EXPANSION_ARENA_SHEETS:
        records.append(source_record(
            SOURCE_ROOT / "forge-arena-sources" / f"forge-arenas-{first:02d}-{last:02d}-openai-v1.png",
            f"forge-arenas-{first:02d}-{last:02d}-v1",
        ))
    return records


def main() -> None:
    manifest: dict = {
        "schemaVersion": 2,
        "release": "2.7.0",
        "generator": "OpenAI ImageGen built-in + deterministic Pillow segmentation",
        "license": "Original project artwork",
        "viewport": {"width": 1280, "height": 720, "groundY": 620},
        "sourcePolicy": "Masters are provenance-only and are never runtime files.",
        "sourceMasters": master_inventory(),
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
        for layer, speed in zip(ARENA_LAYERS, (0.015, 0.055, 0.12, 0.19)):
            layers[layer]["speed"] = speed
        manifest["arenas"][boss] = {
            "kind": "parallax", "viewport": {"width": 1280, "height": 720},
            "groundY": 620, "layers": layers,
        }

    arena_source_root = SOURCE_ROOT / "forge-arena-sources"
    for first, last in EXPANSION_ARENA_SHEETS:
        master_path = arena_source_root / f"forge-arenas-{first:02d}-{last:02d}-openai-v1.png"
        master = source(master_path)
        for cell_index, boss_id in enumerate(EXPANSION_BOSSES[first - 7:last - 6]):
            backdrop, crop_metadata = normalize_arena_backdrop(master, cell_index)
            asset = save_runtime(backdrop, f"arenas/{boss_id}/backdrop.webp", False, quality=80)
            manifest["arenas"][boss_id] = {
                "kind": "backdrop", "viewport": {"width": 1280, "height": 720},
                "groundY": 620, "telegraphSafe": True, "backdrop": asset,
                "source": {
                    "masterSha256": sha256(master_path.read_bytes()).hexdigest(),
                    **crop_metadata,
                },
            }

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
    for name, source_name, extent in (
        ("body-core", "riva-body-core-openai-v4.png", 400),
        ("firing-arm", "riva-firing-arm-openai-v4.png", 370),
    ):
        runtime = normalize_sprite(source(SOURCE_ROOT / "riva" / source_name), extent)
        manifest["heroine"]["parts"][name] = save_runtime(runtime, f"heroine/riva-spark/{name}.webp", True)

    expansion_root = SOURCE_ROOT / "expansion-sources"
    for start in range(0, len(EXPANSION_BOSSES), 6):
        first, last = 7 + start, 12 + start
        master_path = expansion_root / f"bosses-{first:02d}-{last:02d}-source.png"
        master = source(master_path)
        for cell_index, boss_id in enumerate(EXPANSION_BOSSES[start:start + 6]):
            sprite = normalize_sprite(master.crop(cell_box(master.size, 3, 2, cell_index)), 394)
            threshold = {"counterforge": 3000, "loadout-reactor": 1000, "hive-foreman": 200, "tempest-regulator": 35}.get(boss_id, 250)
            sprite = remove_alpha_islands(sprite, threshold)
            layers, rig = split_expansion_sprite(sprite, EXPANSION_WEAK_CORES[boss_id])
            parts = {}
            for part_name in EXPANSION_PARTS:
                asset = save_runtime(layers[part_name], f"bosses/{boss_id}/{part_name}.webp", True)
                parts[part_name] = {**asset, **part_metadata(part_name, rig)}
            manifest["bosses"][boss_id] = {
                "rig": {
                    **rig,
                    "sourceMasterSha256": sha256(master_path.read_bytes()).hexdigest(),
                    "sourceCell": cell_index,
                    "compositeSha256": sha256(sprite.tobytes()).hexdigest(),
                },
                "parts": parts,
            }

    vfx = source(SOURCE_ROOT / "vfx" / "circuit-vfx-openai-v1.png")
    for index, effect in enumerate(VFX):
        crop = extract_alpha(vfx.crop(cell_box(vfx.size, 4, 4, index)))
        manifest["vfx"][effect] = save_runtime(crop, f"vfx/{effect}.webp", True)

    entries = []
    for arena in manifest["arenas"].values():
        if arena["kind"] == "parallax":
            entries.extend(arena["layers"].values())
        else:
            entries.append(arena["backdrop"])
    for boss in manifest["bosses"].values():
        entries.extend(boss["parts"].values())
    entries.extend(manifest["heroine"]["parts"].values())
    entries.extend(manifest["vfx"].values())
    manifest["summary"] = {
        "masters": len(manifest["sourceMasters"]),
        "runtimeFiles": len(entries),
        "arenaLayers": len(CORE_BOSSES) * len(ARENA_LAYERS),
        "arenaBackdrops": len(EXPANSION_BOSSES),
        "bossParts": len(CORE_BOSSES) * 9 + len(EXPANSION_BOSSES) * len(EXPANSION_PARTS),
        "heroineParts": len(manifest["heroine"]["parts"]),
        "vfx": len(manifest["vfx"]),
        "totalBytes": sum(entry["bytes"] for entry in entries),
    }
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest["summary"], ensure_ascii=False))


if __name__ == "__main__":
    main()
