import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

export const ASSET_RELEASE = '2.7.0';
export const ASSET_DIRECTORY = 'v' + ASSET_RELEASE;
export const ASSET_MANIFEST_PATH = 'assets/generated/v2.7.0/asset-manifest.json';
export const ASSET_BUDGET_BYTES = 22 * 1024 * 1024;
export const EXPECTED_COUNTS = Object.freeze({
  runtimeFiles: 225,
  arenaLayers: 24,
  arenaBackdrops: 24,
  bossParts: 150,
  heroineParts: 11,
  vfx: 16,
  alpha: 195,
  opaque: 30,
  masters: 26,
});
export const CATEGORY_BUDGETS = Object.freeze({
  arena: 512 * 1024,
  boss: 256 * 1024,
  heroine: 256 * 1024,
  vfx: 128 * 1024,
});
export const CORE_BOSS_IDS = Object.freeze(['rammer', 'kraken', 'drill', 'mantis', 'cyclotron', 'omega']);
export const EXPANSION_BOSS_IDS = Object.freeze([
  'bastion-ricochet', 'hydraulic-warden', 'hive-foreman', 'echo-fencer', 'breaker-array', 'vertical-verdict',
  'rail-tyrant', 'triplex-hunter', 'ground-eater', 'floodline-leviathan', 'centrifuge-zero', 'tempest-regulator',
  'ascension-frame', 'counterforge', 'carrier-cathedral', 'twin-governors', 'loadout-reactor', 'orbital-famine',
  'logic-crucible', 'vector-vault', 'skyborne-battery', 'endurance-engine', 'adaptive-archivist', 'null-crown',
]);
export const BOSS_IDS = Object.freeze([...CORE_BOSS_IDS, ...EXPANSION_BOSS_IDS]);
export const EXPANSION_PART_NAMES = Object.freeze(['chassis', 'core', 'appendage-left', 'appendage-right']);
const ARENA_LAYERS = Object.freeze(['far', 'mid', 'ground', 'foreground']);
const WEBP_HEADER = Buffer.from('WEBP');
const RIFF_HEADER = Buffer.from('RIFF');
const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function keysMatch(value, expected, label) {
  const actual = Object.keys(value || {}).sort();
  const wanted = [...expected].sort();
  invariant(JSON.stringify(actual) === JSON.stringify(wanted), label + ': attendu ' + wanted.join(', ') + ', recu ' + actual.join(', '));
}

function hasChunk(bytes, chunk) {
  return bytes.includes(Buffer.from(chunk, 'ascii'));
}

function normalizedPoint(value, label) {
  invariant(value && Number.isFinite(value.x) && Number.isFinite(value.y), label + ': point absent');
  invariant(value.x >= 0 && value.x <= 1 && value.y >= 0 && value.y <= 1, label + ': point hors canevas');
}

export function readWebpMetadata(bytes, label = 'WebP') {
  invariant(Buffer.isBuffer(bytes), label + ': buffer attendu');
  invariant(bytes.length >= 30, label + ': fichier tronque');
  invariant(bytes.subarray(0, 4).equals(RIFF_HEADER), label + ': signature RIFF absente');
  invariant(bytes.subarray(8, 12).equals(WEBP_HEADER), label + ': signature WEBP absente');
  const declaredLength = bytes.readUInt32LE(4) + 8;
  invariant(declaredLength === bytes.length, label + ': taille RIFF incoherente (' + declaredLength + ' / ' + bytes.length + ')');

  const chunk = bytes.toString('ascii', 12, 16);
  let width;
  let height;
  let alpha = false;
  let animated = false;

  if (chunk === 'VP8L') {
    invariant(bytes[20] === 0x2f, label + ': signature VP8L invalide');
    const bits = bytes.readUInt32LE(21);
    width = (bits & 0x3fff) + 1;
    height = ((bits >>> 14) & 0x3fff) + 1;
    alpha = Boolean((bits >>> 28) & 1);
  } else if (chunk === 'VP8 ') {
    invariant(bytes.subarray(23, 26).equals(Buffer.from([0x9d, 0x01, 0x2a])), label + ': frame VP8 invalide');
    width = bytes.readUInt16LE(26) & 0x3fff;
    height = bytes.readUInt16LE(28) & 0x3fff;
  } else if (chunk === 'VP8X') {
    const flags = bytes[20];
    width = bytes.readUIntLE(24, 3) + 1;
    height = bytes.readUIntLE(27, 3) + 1;
    alpha = Boolean(flags & 0x10);
    animated = Boolean(flags & 0x02);
  } else {
    throw new Error(label + ': chunk WebP non accepte ' + JSON.stringify(chunk));
  }

  animated ||= hasChunk(bytes, 'ANIM') || hasChunk(bytes, 'ANMF');
  invariant(!animated, label + ': WebP anime interdit pour le runtime');
  invariant(width > 0 && height > 0, label + ': dimensions invalides');
  return { width, height, alpha, chunk };
}

export function readPngMetadata(bytes, label = 'PNG') {
  invariant(Buffer.isBuffer(bytes) && bytes.length >= 24, label + ': PNG tronque');
  invariant(bytes.subarray(0, 8).equals(PNG_HEADER), label + ': signature PNG absente');
  invariant(bytes.toString('ascii', 12, 16) === 'IHDR', label + ': IHDR absent');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

export function flattenAssetManifest(manifest) {
  const entries = [];
  for (const [bossId, arena] of Object.entries(manifest.arenas || {})) {
    if (arena.kind === 'parallax') {
      for (const [name, asset] of Object.entries(arena.layers || {})) {
        entries.push({ id: 'arena:' + bossId + ':' + name, kind: 'arena', owner: bossId, name, ...asset });
      }
    } else if (arena.kind === 'backdrop' && arena.backdrop) {
      entries.push({ id: 'arena:' + bossId + ':backdrop', kind: 'arena', owner: bossId, name: 'backdrop', ...arena.backdrop });
    }
  }
  for (const [bossId, boss] of Object.entries(manifest.bosses || {})) {
    for (const [name, asset] of Object.entries(boss.parts || {})) {
      entries.push({ id: 'boss:' + bossId + ':' + name, kind: 'boss', owner: bossId, name, ...asset });
    }
  }
  for (const [name, asset] of Object.entries(manifest.heroine?.parts || {})) {
    entries.push({ id: 'heroine:' + manifest.heroine.id + ':' + name, kind: 'heroine', owner: manifest.heroine.id, name, ...asset });
  }
  for (const [name, asset] of Object.entries(manifest.vfx || {})) {
    entries.push({ id: 'vfx:' + name, kind: 'vfx', owner: 'combat', name, ...asset });
  }
  return entries;
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }));
  return nested.flat();
}

function validateDimensions(entry) {
  if (entry.kind === 'arena') {
    const expected = entry.name === 'backdrop' ? [768, 432] : [768, 512];
    invariant(entry.width === expected[0] && entry.height === expected[1], entry.id + ': dimensions arene ' + expected.join('x') + ' attendues');
  } else if (entry.kind === 'boss' || entry.kind === 'heroine') {
    invariant(entry.width === 418 && entry.height === 418, entry.id + ': une piece articulee doit mesurer 418x418');
  } else {
    invariant([313, 314].includes(entry.width) && [313, 314].includes(entry.height), entry.id + ': un VFX doit mesurer 313 ou 314 px par cote');
  }
}

function validateExpansionRig(bossId, boss) {
  keysMatch(boss.parts, EXPANSION_PART_NAMES, 'Rig boss extension ' + bossId);
  const rig = boss.rig;
  invariant(rig?.canvas?.width === 418 && rig?.canvas?.height === 418, bossId + ': canevas rig 418x418 attendu');
  invariant(rig?.drawSize?.width === 236 && rig?.drawSize?.height === 236, bossId + ': drawSize 236x236 attendu');
  normalizedPoint(rig?.origin, bossId + ': origin');
  normalizedPoint(rig?.weakCore, bossId + ': weakCore');
  invariant(rig.weakCore.part === 'core', bossId + ': weakCore doit viser core');
  invariant(Number.isFinite(rig.weakCore.radius) && rig.weakCore.radius > 0.04 && rig.weakCore.radius < 0.2, bossId + ': rayon weakCore invalide');
  invariant(/^[a-f0-9]{64}$/.test(rig.sourceMasterSha256 || ''), bossId + ': hash master rig invalide');
  invariant(/^[a-f0-9]{64}$/.test(rig.compositeSha256 || ''), bossId + ': hash composite rig invalide');
  invariant(Number.isInteger(rig.sourceCell) && rig.sourceCell >= 0 && rig.sourceCell < 6, bossId + ': cellule source invalide');
  keysMatch(rig.coveragePixels, EXPANSION_PART_NAMES, 'Couverture rig ' + bossId);
  invariant(Object.values(rig.coveragePixels).every(value => Number.isInteger(value) && value >= 64), bossId + ': une piece ne couvre pas assez de pixels');

  for (const [name, part] of Object.entries(boss.parts)) {
    invariant(['chassis', 'weak-core', 'appendage'].includes(part.role), bossId + ':' + name + ': role invalide');
    normalizedPoint(part.pivot, bossId + ':' + name + ': pivot');
    normalizedPoint(part.joint, bossId + ':' + name + ': joint');
    invariant(Number.isInteger(part.z) && part.z >= 0 && part.z <= 2, bossId + ':' + name + ': z invalide');
    invariant(part.drawSize?.width === 236 && part.drawSize?.height === 236, bossId + ':' + name + ': drawSize invalide');
  }
  invariant(boss.parts.core.role === 'weak-core' && boss.parts.core.weakCore === true, bossId + ': couche core non marquee weakCore');
  invariant(boss.parts['appendage-left'].side === 'left', bossId + ': appendage gauche mal declare');
  invariant(boss.parts['appendage-right'].side === 'right', bossId + ': appendage droit mal declare');
}

export async function validateRuntimeAssets(rootDirectory = process.cwd(), options = {}) {
  const validateMasters = options.validateMasters !== false;
  const root = resolve(rootDirectory);
  const runtimeRoot = resolve(root, 'assets', 'generated', ASSET_DIRECTORY);
  const manifestFile = resolve(root, ASSET_MANIFEST_PATH);
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));

  invariant(manifest.schemaVersion === 2, 'asset-manifest: schemaVersion 2 attendu');
  invariant(manifest.release === ASSET_RELEASE, 'asset-manifest: release ' + ASSET_RELEASE + ' attendue');
  invariant(typeof manifest.generator === 'string' && manifest.generator.length > 0, 'asset-manifest: generateur absent');
  invariant(typeof manifest.license === 'string' && manifest.license.length > 0, 'asset-manifest: licence absente');
  invariant(manifest.viewport?.width === 1280 && manifest.viewport?.height === 720 && manifest.viewport?.groundY === 620, 'viewport gameplay 1280x720 / sol 620 attendu');
  invariant(typeof manifest.sourcePolicy === 'string' && /never runtime/i.test(manifest.sourcePolicy), 'politique masters absente');
  keysMatch(manifest.arenas, BOSS_IDS, 'Arenes');
  keysMatch(manifest.bosses, BOSS_IDS, 'Boss');

  for (const bossId of CORE_BOSS_IDS) {
    const arena = manifest.arenas[bossId];
    invariant(arena.kind === 'parallax', 'Arene core ' + bossId + ': parallax attendu');
    invariant(arena.groundY === 620, 'Arene core ' + bossId + ': groundY 620 attendu');
    keysMatch(arena.layers, ARENA_LAYERS, 'Couches arene ' + bossId);
    invariant(Object.keys(manifest.bosses[bossId].parts || {}).length === 9, 'Boss ' + bossId + ': 9 pieces attendues');
    for (const [layer, asset] of Object.entries(arena.layers)) {
      invariant(Number.isFinite(asset.speed) && asset.speed > 0 && asset.speed < 1, 'arena:' + bossId + ':' + layer + ': vitesse parallax invalide');
      invariant(asset.alpha === (layer !== 'far'), 'arena:' + bossId + ':' + layer + ': contrat alpha invalide');
    }
  }

  for (const bossId of EXPANSION_BOSS_IDS) {
    const arena = manifest.arenas[bossId];
    invariant(arena.kind === 'backdrop', 'Arene Forge ' + bossId + ': backdrop attendu');
    invariant(arena.groundY === 620 && arena.telegraphSafe === true, 'Arene Forge ' + bossId + ': contrat gameplay invalide');
    invariant(arena.backdrop?.alpha === false, 'Arene Forge ' + bossId + ': backdrop opaque attendu');
    invariant(/^[a-f0-9]{64}$/.test(arena.source?.masterSha256 || ''), 'Arene Forge ' + bossId + ': provenance master invalide');
    invariant(Number.isInteger(arena.source?.atlasCell) && arena.source.atlasCell >= 0 && arena.source.atlasCell < 4, 'Arene Forge ' + bossId + ': cellule atlas invalide');
    validateExpansionRig(bossId, manifest.bosses[bossId]);
  }

  invariant(manifest.heroine?.id === 'riva-spark', 'Heroine riva-spark attendue');
  invariant(Object.keys(manifest.heroine.parts || {}).length === EXPECTED_COUNTS.heroineParts, '11 pieces heroine attendues');
  invariant(Object.keys(manifest.vfx || {}).length === EXPECTED_COUNTS.vfx, '16 VFX attendus');

  invariant(Array.isArray(manifest.sourceMasters) && manifest.sourceMasters.length === EXPECTED_COUNTS.masters, EXPECTED_COUNTS.masters + ' masters de provenance attendus');
  const masterFiles = new Set();
  for (const master of manifest.sourceMasters) {
    invariant(typeof master.file === 'string' && /^assets\/generated\/.+\.png$/.test(master.file), 'Master: chemin PNG invalide');
    invariant(!master.file.includes('/v2.7.0/'), 'Master publie dans le runtime: ' + master.file);
    invariant(!masterFiles.has(master.file), 'Master duplique: ' + master.file);
    masterFiles.add(master.file);
    invariant(/^[a-f0-9]{64}$/.test(master.sha256 || ''), 'Master: SHA-256 invalide ' + master.file);
    if (!validateMasters) continue;
    const bytes = await readFile(resolve(root, master.file));
    invariant(bytes.length === master.bytes, 'Master: taille incoherente ' + master.file);
    invariant(createHash('sha256').update(bytes).digest('hex') === master.sha256, 'Master: hash incoherent ' + master.file);
    const png = readPngMetadata(bytes, master.file);
    invariant(png.width === master.width && png.height === master.height, 'Master: dimensions incoherentes ' + master.file);
  }

  const entries = flattenAssetManifest(manifest);
  invariant(entries.length === EXPECTED_COUNTS.runtimeFiles, EXPECTED_COUNTS.runtimeFiles + ' assets runtime attendus, recu ' + entries.length);
  invariant(entries.filter(entry => entry.kind === 'arena' && entry.name !== 'backdrop').length === EXPECTED_COUNTS.arenaLayers, '24 couches arene attendues');
  invariant(entries.filter(entry => entry.kind === 'arena' && entry.name === 'backdrop').length === EXPECTED_COUNTS.arenaBackdrops, '24 backdrops Forge attendus');
  invariant(entries.filter(entry => entry.kind === 'boss').length === EXPECTED_COUNTS.bossParts, '150 pieces boss attendues');

  const ids = new Set();
  const sources = new Set();
  let totalBytes = 0;
  let alphaCount = 0;
  let opaqueCount = 0;
  const verified = [];

  for (const entry of entries) {
    invariant(!ids.has(entry.id), 'Identifiant duplique: ' + entry.id);
    ids.add(entry.id);
    invariant(typeof entry.src === 'string' && /^assets\/generated\/v2\.7\.0\/.+\.webp$/.test(entry.src), entry.id + ': chemin runtime invalide');
    invariant(!entry.src.includes('..') && !entry.src.includes('\\'), entry.id + ': chemin non securise');
    invariant(!sources.has(entry.src), 'Source dupliquee: ' + entry.src);
    sources.add(entry.src);
    invariant(Number.isInteger(entry.width) && Number.isInteger(entry.height), entry.id + ': dimensions entieres requises');
    validateDimensions(entry);
    invariant(typeof entry.alpha === 'boolean', entry.id + ': contrat alpha manquant');
    invariant(Number.isInteger(entry.bytes) && entry.bytes > 0, entry.id + ': budget bytes invalide');
    invariant(entry.bytes <= CATEGORY_BUDGETS[entry.kind], entry.id + ': budget individuel depasse (' + entry.bytes + ')');
    invariant(/^[a-f0-9]{64}$/.test(entry.sha256), entry.id + ': SHA-256 invalide');

    const file = resolve(root, entry.src);
    const bytes = await readFile(file);
    invariant(bytes.length === entry.bytes, entry.id + ': taille catalogue ' + entry.bytes + ', fichier ' + bytes.length);
    const digest = createHash('sha256').update(bytes).digest('hex');
    invariant(digest === entry.sha256, entry.id + ': SHA-256 different du catalogue');
    const metadata = readWebpMetadata(bytes, entry.id);
    invariant(metadata.width === entry.width && metadata.height === entry.height, entry.id + ': dimensions WebP incoherentes');
    invariant(metadata.alpha === entry.alpha, entry.id + ': alpha WebP incoherent');
    if (entry.alpha) alphaCount += 1;
    else opaqueCount += 1;
    totalBytes += bytes.length;
    verified.push({ ...entry, file, sha256: digest, chunk: metadata.chunk });
  }

  invariant(alphaCount === EXPECTED_COUNTS.alpha, EXPECTED_COUNTS.alpha + ' assets alpha attendus, recu ' + alphaCount);
  invariant(opaqueCount === EXPECTED_COUNTS.opaque, EXPECTED_COUNTS.opaque + ' assets opaques attendus, recu ' + opaqueCount);
  invariant(totalBytes <= ASSET_BUDGET_BYTES, 'Budget runtime depasse: ' + totalBytes + ' / ' + ASSET_BUDGET_BYTES);

  const expectedSummary = {
    masters: EXPECTED_COUNTS.masters,
    runtimeFiles: EXPECTED_COUNTS.runtimeFiles,
    arenaLayers: EXPECTED_COUNTS.arenaLayers,
    arenaBackdrops: EXPECTED_COUNTS.arenaBackdrops,
    bossParts: EXPECTED_COUNTS.bossParts,
    heroineParts: EXPECTED_COUNTS.heroineParts,
    vfx: EXPECTED_COUNTS.vfx,
    totalBytes,
  };
  for (const [key, expected] of Object.entries(expectedSummary)) {
    invariant(manifest.summary?.[key] === expected, 'Resume ' + key + ': attendu ' + expected + ', recu ' + manifest.summary?.[key]);
  }

  const actualRuntimeFiles = (await listFiles(runtimeRoot)).map(file => relative(root, file).replaceAll('\\', '/')).sort();
  const expectedRuntimeFiles = [ASSET_MANIFEST_PATH, ...sources].sort();
  invariant(JSON.stringify(actualRuntimeFiles) === JSON.stringify(expectedRuntimeFiles), 'Le dossier runtime contient un fichier absent du catalogue ou il manque un asset declare.');
  invariant([...masterFiles].every(file => !expectedRuntimeFiles.includes(file)), 'Un master OpenAI est publie dans le runtime.');

  return { manifest, entries: verified, totalBytes, alphaCount, opaqueCount, files: expectedRuntimeFiles, masterFiles: [...masterFiles] };
}
