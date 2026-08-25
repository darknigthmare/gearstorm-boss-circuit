"""Build independent runtime art from the OpenAI master sheets.

The deterministic post-process removes baked checker previews, turns the six
OpenAI Forge arena atlases into four depth planes per arena, and partitions each
OpenAI expansion boss into seven independently drawable rig layers. It never
replaces the authored source pixels; transforms and masks remain reproducible.
"""

from __future__ import annotations

from collections import deque
from hashlib import sha256
from pathlib import Path
from shutil import rmtree
import json

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = ROOT / "assets" / "generated"
RIVA_SOURCE_ROOT = SOURCE_ROOT / "riva-v2.9-sources"
RIVA_SPLIT_SOURCE_ROOT = SOURCE_ROOT / "riva-v2.11-sources"
NARRATIVE_SOURCE_ROOT = SOURCE_ROOT / "narrative-v2.9-sources"
ASSET_RELEASE = "v2.11.0"
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
RIVA_ANATOMY_PARTS = (
    "thigh-far", "shin-far", "boot-far", "upper-arm-far", "forearm-far",
    "pelvis", "torso", "thigh-near", "shin-near", "boot-near",
    "upper-arm-near", "forearm-near", "cannon-near", "head",
)
RIVA_EFFECT_PARTS = ("dash-trail", "overload-halo")
HERO_PARTS = RIVA_ANATOMY_PARTS + RIVA_EFFECT_PARTS
RIVA_PART_CONTRACTS = {
    "thigh-far": {"extent": 145, "pivotFraction": (0.50, 0.12), "joint": (-9, 5), "parent": "pelvis", "side": "far", "z": 10, "motion": "leg-far"},
    "shin-far": {"extent": 150, "pivotFraction": (0.50, 0.12), "joint": (-10, 42), "parent": "thigh-far", "side": "far", "z": 11, "motion": "leg-far"},
    "boot-far": {"extent": 112, "pivotFraction": (0.50, 0.20), "joint": (-12, 80), "parent": "shin-far", "side": "far", "z": 12, "motion": "leg-far"},
    "upper-arm-far": {"extent": 128, "pivotFraction": (0.50, 0.14), "joint": (-27, -48), "parent": "torso", "side": "far", "z": 13, "motion": "arm-far"},
    "forearm-far": {"extent": 132, "pivotFraction": (0.50, 0.12), "joint": (-28, -15), "parent": "upper-arm-far", "side": "far", "z": 14, "motion": "arm-far"},
    "pelvis": {"extent": 126, "pivotFraction": (0.50, 0.50), "joint": (0, 0), "parent": None, "side": "center", "z": 30, "motion": "pelvis"},
    "torso": {"extent": 205, "pivotFraction": (0.50, 0.86), "joint": (0, -18), "parent": "pelvis", "side": "center", "z": 40, "motion": "torso"},
    "thigh-near": {"extent": 145, "pivotFraction": (0.50, 0.12), "joint": (9, 5), "parent": "pelvis", "side": "near", "z": 50, "motion": "leg-near"},
    "shin-near": {"extent": 150, "pivotFraction": (0.50, 0.12), "joint": (10, 42), "parent": "thigh-near", "side": "near", "z": 51, "motion": "leg-near"},
    "boot-near": {"extent": 112, "pivotFraction": (0.50, 0.20), "joint": (13, 80), "parent": "shin-near", "side": "near", "z": 52, "motion": "leg-near"},
    "upper-arm-near": {"extent": 128, "pivotFraction": (0.50, 0.14), "joint": (29, -48), "parent": "torso", "side": "near", "z": 60, "motion": "arm-near"},
    # Both layers share the original transform so their neutral composition is
    # pixel-identical to the proven v2.10 OpenAI sprite.
    "forearm-near": {"extent": 210, "pivotFraction": (0.78, 0.18), "joint": (29, -15), "parent": "upper-arm-near", "side": "near", "z": 70, "motion": "cannon-mount"},
    "cannon-near": {"extent": 210, "pivotFraction": (0.78, 0.18), "joint": (29, -15), "parent": "forearm-near", "side": "near", "z": 71, "motion": "cannon-recoil"},
    "head": {"extent": 132, "pivotFraction": (0.68, 0.92), "joint": (0, -70), "parent": "torso", "side": "center", "z": 80, "motion": "head"},
}
RIVA_CANNON_MUZZLE_POINT = (149, 297)
RIVA_HEAD_DROP_Y = 4
NARRATIVE = ("intro-broadcast", "prologue-m0", "campaign-ending", "forge-ending")
NARRATIVE_LAYOUTS = {
    "intro-broadcast": {"focalPoint": {"x": 0.20, "y": 0.70}, "safeTextZone": {"x": 0.07, "y": 0.06, "width": 0.36, "height": 0.32}},
    "prologue-m0": {"focalPoint": {"x": 0.22, "y": 0.58}, "safeTextZone": {"x": 0.60, "y": 0.10, "width": 0.34, "height": 0.62}},
    "campaign-ending": {"focalPoint": {"x": 0.82, "y": 0.45}, "safeTextZone": {"x": 0.04, "y": 0.06, "width": 0.36, "height": 0.32}},
    "forge-ending": {"focalPoint": {"x": 0.25, "y": 0.63}, "safeTextZone": {"x": 0.67, "y": 0.10, "width": 0.28, "height": 0.60}},
}
VFX = (
    "muzzle-cyan", "impact-metal", "shield-hit", "magnetic-spark",
    "smoke", "rivet-sparks", "electric-arcs", "molten-splash",
    "warning-pulse", "dash-shockwave", "overload-bloom", "chrono-fracture",
    "explosion-small", "explosion-core", "explosion-final", "scrap-glow",
)
EXPANSION_PARTS = (
    "chassis", "armor-shell", "appendage-left-root", "appendage-left-tip",
    "appendage-right-root", "appendage-right-tip", "core",
)
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


def alpha_geometry(image: Image.Image) -> tuple[list[int], int]:
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        raise ValueError("Generated sprite contains no visible pixels")
    left, top, right, bottom = bounds
    coverage = sum(1 for value in alpha.get_flattened_data() if value > 8)
    return [left, top, right - left, bottom - top], coverage


def normalize_riva_part(image: Image.Image, contract: dict) -> tuple[Image.Image, dict]:
    rgba = extract_alpha(image)
    bounds = rgba.getchannel("A").getbbox()
    if not bounds:
        raise ValueError("Riva part contains no visible pixels")
    crop = rgba.crop(bounds)
    extent = int(contract["extent"])
    crop.thumbnail((extent, extent), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (418, 418), (0, 0, 0, 0))
    left = (418 - crop.width) // 2
    top = (418 - crop.height) // 2
    canvas.alpha_composite(crop, (left, top))
    fraction_x, fraction_y = contract["pivotFraction"]
    pivot = [
        left + round((crop.width - 1) * fraction_x),
        top + round((crop.height - 1) * fraction_y),
    ]
    bbox, coverage = alpha_geometry(canvas)
    return canvas, {"pivot": pivot, "bbox": bbox, "coveragePixels": coverage}


def split_riva_forearm_cannon() -> tuple[dict[str, Image.Image], dict]:
    """Split the proven combined OpenAI sprite without changing one source pixel."""
    source_path = RIVA_SOURCE_ROOT / "forearm-cannon-near-openai-v1.png"
    contract = RIVA_PART_CONTRACTS["forearm-near"]
    combined, geometry = normalize_riva_part(source(source_path), contract)
    pivot_x, pivot_y = geometry["pivot"]
    muzzle_x, muzzle_y = RIVA_CANNON_MUZZLE_POINT
    axis_x, axis_y = muzzle_x - pivot_x, muzzle_y - pivot_y
    axis_length_sq = max(1, axis_x * axis_x + axis_y * axis_y)
    source_alpha = combined.getchannel("A").load()
    masks = {
        "forearm-near": Image.new("L", combined.size, 0),
        "cannon-near": Image.new("L", combined.size, 0),
    }
    writers = {name: mask.load() for name, mask in masks.items()}
    counts = {name: 0 for name in masks}

    for y in range(combined.height):
        for x in range(combined.width):
            value = source_alpha[x, y]
            if value <= 0:
                continue
            progress = ((x - pivot_x) * axis_x + (y - pivot_y) * axis_y) / axis_length_sq
            name = "cannon-near" if progress >= 0.43 else "forearm-near"
            writers[name][x, y] = value
            counts[name] += 1

    layers = {}
    for name, mask in masks.items():
        layer = combined.copy()
        layer.putalpha(mask)
        layers[name] = layer
    recomposite = Image.alpha_composite(layers["forearm-near"], layers["cannon-near"])
    if recomposite.tobytes() != combined.tobytes():
        raise ValueError("Riva split must recompose the original pixels exactly")
    if layers["cannon-near"].getchannel("A").getpixel(RIVA_CANNON_MUZZLE_POINT) <= 8:
        raise ValueError("Riva cannon layer must own the declared muzzle pixel")
    return layers, {
        **geometry,
        "coveragePixels": counts,
        "combinedCoveragePixels": geometry["coveragePixels"],
        "neutralCompositeSha256": sha256(combined.tobytes()).hexdigest(),
        "splitProgress": 0.43,
    }


def normalize_narrative(image: Image.Image) -> Image.Image:
    return ImageOps.fit(image.convert("RGB"), (1280, 720), Image.Resampling.LANCZOS, centering=(0.5, 0.5))


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


def provenance_record(path: Path, prompt_id: str | None = None, **details) -> dict:
    record = source_record(path, prompt_id)
    provenance = {
        "masterFile": record["file"],
        "masterSha256": record["sha256"],
    }
    if prompt_id:
        provenance["promptId"] = prompt_id
    provenance.update(details)
    return provenance


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


# Forge depth planes remain derived from the approved OpenAI master.
def vertical_depth_mask(size: tuple[int, int], start: float, end: float, feather: float, opacity: int) -> Image.Image:
    width, height = size
    values = []
    for y in range(height):
        ratio = y / max(1, height - 1)
        if ratio < start - feather or ratio > end + feather:
            strength = 0.0
        elif ratio < start:
            strength = (ratio - (start - feather)) / max(feather, 0.001)
        elif ratio > end:
            strength = ((end + feather) - ratio) / max(feather, 0.001)
        else:
            strength = 1.0
        values.append(round(max(0.0, min(1.0, strength)) * opacity))
    column = Image.new("L", (1, height))
    column.putdata(values)
    return column.resize((width, height), Image.Resampling.BILINEAR)


def derive_forge_parallax(backdrop: Image.Image) -> dict[str, Image.Image]:
    """Create subtle, telegraph-safe depth planes from an authored OpenAI arena."""
    far = backdrop.convert("RGB")
    detail = ImageEnhance.Contrast(far).enhance(1.05).filter(ImageFilter.UnsharpMask(1.2, 115, 3))
    contracts = {
        "mid": (0.10, 0.58, 0.13, 76),
        "ground": (0.48, 0.91, 0.10, 104),
        "foreground": (0.76, 1.0, 0.11, 132),
    }
    layers: dict[str, Image.Image] = {"far": far}
    for name, (start, end, feather, opacity) in contracts.items():
        layer = detail.convert("RGBA")
        layer.putalpha(vertical_depth_mask(layer.size, start, end, feather, opacity))
        layers[name] = layer
    return layers


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


def split_expansion_sprite(sprite: Image.Image, hint: tuple[float, float, float], profile_index: int) -> tuple[dict[str, Image.Image], dict]:
    """Partition every source pixel into a seven-layer mechanical rig."""
    rgba = sprite.convert("RGBA")
    alpha = rgba.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        raise ValueError("Expansion sprite contains no visible pixels")
    left, top, right, bottom = bounds
    width, height = right - left, bottom - top
    middle_x = (left + right) / 2
    center_band = width * 0.13
    root_band = width * 0.28
    shell_y = top + height * 0.43
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
            elif y >= base_y:
                part = "chassis"
            elif abs(x - middle_x) <= center_band:
                part = "armor-shell" if y < shell_y else "chassis"
            elif x < middle_x:
                part = "appendage-left-tip" if x < middle_x - root_band else "appendage-left-root"
            else:
                part = "appendage-right-tip" if x > middle_x + root_band else "appendage-right-root"
            writers[part][x, y] = value
            counts[part] += 1

    if min(counts.values()) < 32:
        raise ValueError(f"Rig partition too small: {counts}")
    layers = {}
    for name, mask in masks.items():
        layer = rgba.copy()
        layer.putalpha(mask)
        layers[name] = layer
    recomposite = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    for layer in layers.values():
        recomposite = Image.alpha_composite(recomposite, layer)
    if recomposite.getchannel("A").tobytes() != rgba.getchannel("A").tobytes():
        raise ValueError("Expansion rig must recompose the normalized OpenAI sprite exactly")
    tempo = round(0.82 + (profile_index % 6) * 0.09 + (profile_index // 6) * 0.035, 3)
    amplitude = round(0.012 + (profile_index % 5) * 0.003, 3)

    rig = {
        "schemaVersion": 2,
        "canvas": {"width": 418, "height": 418},
        "origin": {"x": 0.5, "y": 0.5},
        "drawSize": dict(EXPANSION_DRAW_SIZE),
        "weakCore": {
            "part": "core", "x": round(core_x / 417, 4), "y": round(core_y / 417, 4),
            "radius": round(core_radius / 418, 4),
        },
        "motionProfile": {
            "id": f"forge-signature-{profile_index + 7:02d}",
            "tempo": tempo,
            "amplitude": amplitude,
            "phase": round((profile_index * 0.61803398875) % 1, 4),
        },
        "coveragePixels": counts,
        "neutralCompositeSha256": sha256(rgba.tobytes()).hexdigest(),
    }
    return layers, rig


def part_metadata(name: str, rig: dict) -> dict:
    weak = rig["weakCore"]
    profile = rig["motionProfile"]
    roles = {
        "chassis": "chassis", "armor-shell": "armor-shell", "core": "weak-core",
        "appendage-left-root": "appendage-root", "appendage-left-tip": "appendage-tip",
        "appendage-right-root": "appendage-root", "appendage-right-tip": "appendage-tip",
    }
    parents = {
        "chassis": None, "armor-shell": "chassis", "core": "chassis",
        "appendage-left-root": "chassis", "appendage-left-tip": "appendage-left-root",
        "appendage-right-root": "chassis", "appendage-right-tip": "appendage-right-root",
    }
    joints = {
        "chassis": (0.5, 0.58), "armor-shell": (0.5, 0.43), "core": (weak["x"], weak["y"]),
        "appendage-left-root": (0.39, 0.52), "appendage-left-tip": (0.25, 0.54),
        "appendage-right-root": (0.61, 0.52), "appendage-right-tip": (0.75, 0.54),
    }
    motion_types = {
        "chassis": "sway", "armor-shell": "breath", "core": "pulse",
        "appendage-left-root": "hinge", "appendage-left-tip": "servo",
        "appendage-right-root": "hinge", "appendage-right-tip": "servo",
    }
    logical_slots = {
        "appendage-left-root": 0, "appendage-right-root": 1,
        "appendage-left-tip": 2, "appendage-right-tip": 3,
    }
    side = "left" if "-left-" in name else "right" if "-right-" in name else "center"
    metadata = {
        "role": roles[name],
        "parent": parents[name],
        "pivot": {"x": joints[name][0], "y": joints[name][1]},
        "joint": {"x": joints[name][0], "y": joints[name][1]},
        "z": EXPANSION_PARTS.index(name),
        "side": side,
        "logicalSlot": logical_slots.get(name),
        "motion": {
            "type": motion_types[name],
            "amplitude": profile["amplitude"] * (1.35 if name.endswith("-tip") else 1),
            "frequency": profile["tempo"] * (1.28 if name.endswith("-tip") else 1),
            "phase": profile["phase"] + EXPANSION_PARTS.index(name) * 0.41,
        },
        "drawSize": dict(EXPANSION_DRAW_SIZE),
        "independentRuntimePart": True,
    }
    if name == "core":
        metadata["weakCore"] = True
    return metadata


def master_inventory() -> list[dict]:
    records = []
    for boss in CORE_BOSSES:
        records.append(source_record(SOURCE_ROOT / "arenas" / f"{boss}-parallax-openai-v1.png"))
        records.append(source_record(SOURCE_ROOT / "bosses" / f"{boss}-parts-openai-v1.png"))
    records.append(source_record(SOURCE_ROOT / "riva" / "riva-parts-openai-v1.png", "riva-effects-openai-v1"))
    records.append(source_record(
        RIVA_SOURCE_ROOT / "riva-canonical-openai-v1.png",
        "riva-canonical-v2.9-v1",
    ))
    for part in RIVA_ANATOMY_PARTS:
        if part in {"forearm-near", "cannon-near"}:
            continue
        records.append(source_record(
            RIVA_SOURCE_ROOT / f"{part}-openai-v1.png",
            f"riva-{part}-v2.9-v1",
        ))
    records.append(source_record(
        RIVA_SOURCE_ROOT / "forearm-cannon-near-openai-v1.png",
        "riva-forearm-cannon-near-v2.9-v1",
    ))
    records.append(source_record(
        RIVA_SPLIT_SOURCE_ROOT / "forearm-cannon-split-openai-v1.png",
        "riva-forearm-cannon-split-v2.11-v1",
    ))
    for narrative in NARRATIVE:
        records.append(source_record(
            NARRATIVE_SOURCE_ROOT / f"{narrative}-openai-v1.png",
            f"narrative-{narrative}-v2.9-v1",
        ))
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
    if OUTPUT_ROOT.exists():
        rmtree(OUTPUT_ROOT)
    manifest: dict = {
        "schemaVersion": 4,
        "release": ASSET_RELEASE.removeprefix("v"),
        "generator": "OpenAI ImageGen built-in + deterministic Pillow extraction and normalization",
        "license": "Original project artwork",
        "viewport": {"width": 1280, "height": 720, "groundY": 620},
        "sourcePolicy": "Masters are provenance-only and are never runtime files.",
        "sourceMasters": master_inventory(),
        "arenas": {},
        "bosses": {},
        "heroine": {"id": "riva-spark", "parts": {}},
        "vfx": {},
        "narrative": {},
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
            "groundY": 620, "visualOffsetY": 80, "layers": layers,
        }

    arena_source_root = SOURCE_ROOT / "forge-arena-sources"
    for first, last in EXPANSION_ARENA_SHEETS:
        master_path = arena_source_root / f"forge-arenas-{first:02d}-{last:02d}-openai-v1.png"
        master = source(master_path)
        for cell_index, boss_id in enumerate(EXPANSION_BOSSES[first - 7:last - 6]):
            backdrop, crop_metadata = normalize_arena_backdrop(master, cell_index)
            depth_planes = derive_forge_parallax(backdrop)
            layers = {}
            for layer_name in ARENA_LAYERS:
                layers[layer_name] = save_runtime(
                    depth_planes[layer_name],
                    f"arenas/{boss_id}/{layer_name}.webp",
                    layer_name != "far",
                    quality=80,
                )
            for layer_name, speed in zip(ARENA_LAYERS, (0.012, 0.038, 0.075, 0.13)):
                layers[layer_name]["speed"] = speed
            manifest["arenas"][boss_id] = {
                "kind": "parallax", "viewport": {"width": 1280, "height": 720},
                "groundY": 620, "visualOffsetY": 28, "telegraphSafe": True, "layers": layers,
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

    hero_rig_parts = []
    riva_split_layers, riva_split_contract = split_riva_forearm_cannon()
    for part in RIVA_ANATOMY_PARTS:
        contract = RIVA_PART_CONTRACTS[part]
        split_part = part in riva_split_layers
        if split_part:
            master_path = RIVA_SOURCE_ROOT / "forearm-cannon-near-openai-v1.png"
            prompt_id = "riva-forearm-cannon-near-v2.9-v1"
            runtime = riva_split_layers[part]
            bbox, coverage = alpha_geometry(runtime)
            geometry = {
                "pivot": riva_split_contract["pivot"],
                "bbox": bbox,
                "coveragePixels": coverage,
            }
        else:
            master_path = RIVA_SOURCE_ROOT / f"{part}-openai-v1.png"
            prompt_id = f"riva-{part}-v2.9-v1"
            runtime, geometry = normalize_riva_part(source(master_path), contract)
        asset = save_runtime(runtime, f"heroine/riva-spark/{part}.webp", True)
        asset.update({
            "role": "anatomy",
            "nativePart": True,
            "source": provenance_record(master_path, prompt_id, splitRole=part if split_part else None),
        })
        manifest["heroine"]["parts"][part] = asset
        hero_rig_parts.append({
            "name": part,
            "parent": contract["parent"],
            "side": contract["side"],
            "joint": [
                contract["joint"][0],
                contract["joint"][1] + (RIVA_HEAD_DROP_Y if part == "head" else 0),
            ],
            "pivot": geometry["pivot"],
            "bbox": geometry["bbox"],
            "scale": 0.30,
            "z": contract["z"],
            "motion": contract["motion"],
            "coveragePixels": geometry["coveragePixels"],
        })

    effect_master_path = SOURCE_ROOT / "riva" / "riva-parts-openai-v1.png"
    effect_master = source(effect_master_path)
    effect_contracts = {
        "dash-trail": {"atlasCell": 7, "joint": [-25, -5], "pivot": [209, 209], "scale": 0.34, "z": 5, "motion": "trail"},
        "overload-halo": {"atlasCell": 8, "joint": [0, -20], "pivot": [209, 209], "scale": 0.32, "z": 90, "motion": "halo"},
    }
    for part in RIVA_EFFECT_PARTS:
        contract = effect_contracts[part]
        crop = extract_alpha(effect_master.crop(cell_box(effect_master.size, 3, 3, contract["atlasCell"])))
        bbox, coverage = alpha_geometry(crop)
        asset = save_runtime(crop, f"heroine/riva-spark/{part}.webp", True)
        asset.update({
            "role": "effect",
            "source": provenance_record(effect_master_path, "riva-effects-openai-v1", atlasCell=contract["atlasCell"]),
        })
        manifest["heroine"]["parts"][part] = asset
        hero_rig_parts.append({
            "name": part, "parent": None, "side": "center",
            "joint": contract["joint"], "pivot": contract["pivot"],
            "bbox": bbox, "scale": contract["scale"], "z": contract["z"],
            "motion": contract["motion"], "coveragePixels": coverage,
        })

    anatomy_specs = [part for part in hero_rig_parts if part["name"] in RIVA_ANATOMY_PARTS]
    measured_feet = max(
        part["joint"][1]
        + (part["bbox"][1] + part["bbox"][3] - part["pivot"][1]) * part["scale"]
        for part in anatomy_specs
    )
    root_offset_y = round(36 - measured_feet, 3)
    for part in hero_rig_parts:
        part["joint"][1] = round(part["joint"][1] + root_offset_y, 3)

    hero_rig_parts.sort(key=lambda part: part["z"])
    canonical_path = RIVA_SOURCE_ROOT / "riva-canonical-openai-v1.png"
    manifest["heroine"]["rig"] = {
        "schemaVersion": 2,
        "canvas": {"width": 418, "height": 418},
        "coordinateSpace": "player-local-pixels",
        "feetLocalY": 36,
        "rootOffsetY": root_offset_y,
        "headDropY": RIVA_HEAD_DROP_Y,
        "ground": {"physicalY": 620, "localY": 36},
        "muzzle": {
            "part": "cannon-near",
            "point": list(RIVA_CANNON_MUZZLE_POINT),
        },
        "nearArmSplit": {
            "source": provenance_record(
                RIVA_SOURCE_ROOT / "forearm-cannon-near-openai-v1.png",
                "riva-forearm-cannon-near-v2.9-v1",
            ),
            "separationReference": provenance_record(
                RIVA_SPLIT_SOURCE_ROOT / "forearm-cannon-split-openai-v1.png",
                "riva-forearm-cannon-split-v2.11-v1",
            ),
            "unionBBox": riva_split_contract["bbox"],
            "combinedCoveragePixels": riva_split_contract["combinedCoveragePixels"],
            "neutralCompositeSha256": riva_split_contract["neutralCompositeSha256"],
            "splitProgress": riva_split_contract["splitProgress"],
        },
        "canonicalReference": provenance_record(canonical_path, "riva-canonical-v2.9-v1"),
        "renderOrder": [part["name"] for part in hero_rig_parts],
        "parts": hero_rig_parts,
    }

    expansion_root = SOURCE_ROOT / "expansion-sources"
    for start in range(0, len(EXPANSION_BOSSES), 6):
        first, last = 7 + start, 12 + start
        master_path = expansion_root / f"bosses-{first:02d}-{last:02d}-source.png"
        master = source(master_path)
        for cell_index, boss_id in enumerate(EXPANSION_BOSSES[start:start + 6]):
            sprite = normalize_sprite(master.crop(cell_box(master.size, 3, 2, cell_index)), 394)
            threshold = {"counterforge": 3000, "loadout-reactor": 1000, "hive-foreman": 200, "tempest-regulator": 35}.get(boss_id, 250)
            sprite = remove_alpha_islands(sprite, threshold)
            layers, rig = split_expansion_sprite(sprite, EXPANSION_WEAK_CORES[boss_id], start + cell_index)
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

    for narrative in NARRATIVE:
        master_path = NARRATIVE_SOURCE_ROOT / f"{narrative}-openai-v1.png"
        prompt_id = f"narrative-{narrative}-v2.9-v1"
        runtime = normalize_narrative(source(master_path))
        asset = save_runtime(runtime, f"narrative/{narrative}.webp", False, quality=82)
        asset.update({
            **NARRATIVE_LAYOUTS[narrative],
            "source": provenance_record(master_path, prompt_id),
        })
        manifest["narrative"][narrative] = asset

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
    entries.extend(manifest["narrative"].values())
    manifest["summary"] = {
        "masters": len(manifest["sourceMasters"]),
        "runtimeFiles": len(entries),
        "arenaLayers": len(BOSSES) * len(ARENA_LAYERS),
        "arenaBackdrops": 0,
        "bossParts": len(CORE_BOSSES) * 9 + len(EXPANSION_BOSSES) * len(EXPANSION_PARTS),
        "heroineParts": len(manifest["heroine"]["parts"]),
        "vfx": len(manifest["vfx"]),
        "narrative": len(manifest["narrative"]),
        "totalBytes": sum(entry["bytes"] for entry in entries),
    }
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest["summary"], ensure_ascii=False))


if __name__ == "__main__":
    main()
