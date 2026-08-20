import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

export const ASSET_RELEASE = '2.5.0';
export const ASSET_DIRECTORY = `v${ASSET_RELEASE}`;
export const ASSET_MANIFEST_PATH = 'assets/generated/v2.5.0/asset-manifest.json';
export const ASSET_BUDGET_BYTES = 20 * 1024 * 1024;
export const EXPECTED_COUNTS = Object.freeze({
  runtimeFiles: 103,
  arenaLayers: 24,
  bossParts: 54,
  heroineParts: 9,
  vfx: 16,
  alpha: 97,
  opaque: 6,
  masters: 17,
});
export const CATEGORY_BUDGETS = Object.freeze({
  arena: 512 * 1024,
  boss: 256 * 1024,
  heroine: 256 * 1024,
  vfx: 128 * 1024,
});
export const BOSS_IDS = Object.freeze(['rammer', 'kraken', 'drill', 'mantis', 'cyclotron', 'omega']);
const ARENA_LAYERS = Object.freeze(['far', 'mid', 'ground', 'foreground']);
const WEBP_HEADER = Buffer.from('WEBP');
const RIFF_HEADER = Buffer.from('RIFF');

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function keysMatch(value, expected, label) {
  const actual = Object.keys(value || {}).sort();
  const wanted = [...expected].sort();
  invariant(JSON.stringify(actual) === JSON.stringify(wanted), `${label}: attendu ${wanted.join(', ')}, reçu ${actual.join(', ')}`);
}

function hasChunk(bytes, chunk) {
  return bytes.includes(Buffer.from(chunk, 'ascii'));
}

export function readWebpMetadata(bytes, label = 'WebP') {
  invariant(Buffer.isBuffer(bytes), `${label}: buffer attendu`);
  invariant(bytes.length >= 30, `${label}: fichier tronqué`);
  invariant(bytes.subarray(0, 4).equals(RIFF_HEADER), `${label}: signature RIFF absente`);
  invariant(bytes.subarray(8, 12).equals(WEBP_HEADER), `${label}: signature WEBP absente`);
  const declaredLength = bytes.readUInt32LE(4) + 8;
  invariant(declaredLength === bytes.length, `${label}: taille RIFF incohérente (${declaredLength} / ${bytes.length})`);

  const chunk = bytes.toString('ascii', 12, 16);
  let width;
  let height;
  let alpha = false;
  let animated = false;

  if (chunk === 'VP8L') {
    invariant(bytes[20] === 0x2f, `${label}: signature VP8L invalide`);
    const bits = bytes.readUInt32LE(21);
    width = (bits & 0x3fff) + 1;
    height = ((bits >>> 14) & 0x3fff) + 1;
    alpha = Boolean((bits >>> 28) & 1);
  } else if (chunk === 'VP8 ') {
    invariant(bytes.subarray(23, 26).equals(Buffer.from([0x9d, 0x01, 0x2a])), `${label}: frame VP8 invalide`);
    width = bytes.readUInt16LE(26) & 0x3fff;
    height = bytes.readUInt16LE(28) & 0x3fff;
  } else if (chunk === 'VP8X') {
    const flags = bytes[20];
    width = bytes.readUIntLE(24, 3) + 1;
    height = bytes.readUIntLE(27, 3) + 1;
    alpha = Boolean(flags & 0x10);
    animated = Boolean(flags & 0x02);
  } else {
    throw new Error(`${label}: chunk WebP non accepté ${JSON.stringify(chunk)}`);
  }

  animated ||= hasChunk(bytes, 'ANIM') || hasChunk(bytes, 'ANMF');
  invariant(!animated, `${label}: WebP animé interdit pour le runtime`);
  invariant(width > 0 && height > 0, `${label}: dimensions invalides`);
  return { width, height, alpha, chunk };
}

export function flattenAssetManifest(manifest) {
  const entries = [];

  for (const [bossId, arena] of Object.entries(manifest.arenas || {})) {
    for (const [name, asset] of Object.entries(arena.layers || {})) {
      entries.push({ id: `arena:${bossId}:${name}`, kind: 'arena', owner: bossId, name, ...asset });
    }
  }
  for (const [bossId, boss] of Object.entries(manifest.bosses || {})) {
    for (const [name, asset] of Object.entries(boss.parts || {})) {
      entries.push({ id: `boss:${bossId}:${name}`, kind: 'boss', owner: bossId, name, ...asset });
    }
  }
  for (const [name, asset] of Object.entries(manifest.heroine?.parts || {})) {
    entries.push({ id: `heroine:${manifest.heroine.id}:${name}`, kind: 'heroine', owner: manifest.heroine.id, name, ...asset });
  }
  for (const [name, asset] of Object.entries(manifest.vfx || {})) {
    entries.push({ id: `vfx:${name}`, kind: 'vfx', owner: 'combat', name, ...asset });
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
    invariant(entry.width === 768 && entry.height === 512, `${entry.id}: une couche d’arène doit mesurer 768x512`);
  } else if (entry.kind === 'boss' || entry.kind === 'heroine') {
    invariant(entry.width === 418 && entry.height === 418, `${entry.id}: une pièce articulée doit mesurer 418x418`);
  } else {
    invariant([313, 314].includes(entry.width) && [313, 314].includes(entry.height), `${entry.id}: un VFX doit mesurer 313 ou 314 px par côté`);
  }
}

export async function validateRuntimeAssets(rootDirectory = process.cwd()) {
  const root = resolve(rootDirectory);
  const runtimeRoot = resolve(root, 'assets', 'generated', ASSET_DIRECTORY);
  const manifestFile = resolve(root, ASSET_MANIFEST_PATH);

  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  invariant(manifest.schemaVersion === 1, 'asset-manifest: schemaVersion 1 attendu');
  invariant(manifest.release === ASSET_RELEASE, `asset-manifest: release ${ASSET_RELEASE} attendue`);
  invariant(typeof manifest.generator === 'string' && manifest.generator.length > 0, 'asset-manifest: générateur absent');
  invariant(typeof manifest.license === 'string' && manifest.license.length > 0, 'asset-manifest: licence absente');
  keysMatch(manifest.arenas, BOSS_IDS, 'Arènes');
  keysMatch(manifest.bosses, BOSS_IDS, 'Boss');

  for (const bossId of BOSS_IDS) {
    keysMatch(manifest.arenas[bossId].layers, ARENA_LAYERS, `Couches d’arène ${bossId}`);
    invariant(Object.keys(manifest.bosses[bossId].parts || {}).length === 9, `Boss ${bossId}: 9 pièces attendues`);
    for (const [layer, asset] of Object.entries(manifest.arenas[bossId].layers)) {
      invariant(Number.isFinite(asset.speed) && asset.speed > 0 && asset.speed < 1, `arena:${bossId}:${layer}: vitesse parallax invalide`);
      invariant(asset.alpha === (layer !== 'far'), `arena:${bossId}:${layer}: contrat alpha invalide`);
    }
  }
  invariant(manifest.heroine?.id === 'riva-spark', 'Héroïne riva-spark attendue');
  invariant(Object.keys(manifest.heroine.parts || {}).length === EXPECTED_COUNTS.heroineParts, '9 pièces héroïne attendues');
  invariant(Object.keys(manifest.vfx || {}).length === EXPECTED_COUNTS.vfx, '16 VFX attendus');

  const entries = flattenAssetManifest(manifest);
  invariant(entries.length === EXPECTED_COUNTS.runtimeFiles, `${EXPECTED_COUNTS.runtimeFiles} assets runtime attendus, reçu ${entries.length}`);
  invariant(entries.filter(entry => entry.kind === 'arena').length === EXPECTED_COUNTS.arenaLayers, '24 couches d’arène attendues');
  invariant(entries.filter(entry => entry.kind === 'boss').length === EXPECTED_COUNTS.bossParts, '54 pièces boss attendues');

  const ids = new Set();
  const sources = new Set();
  let totalBytes = 0;
  let alphaCount = 0;
  let opaqueCount = 0;
  const verified = [];

  for (const entry of entries) {
    invariant(!ids.has(entry.id), `Identifiant dupliqué: ${entry.id}`);
    ids.add(entry.id);
    invariant(typeof entry.src === 'string' && /^assets\/generated\/v2\.5\.0\/.+\.webp$/.test(entry.src), `${entry.id}: chemin runtime invalide`);
    invariant(!entry.src.includes('..') && !entry.src.includes('\\'), `${entry.id}: chemin non sécurisé`);
    invariant(!sources.has(entry.src), `Source dupliquée: ${entry.src}`);
    sources.add(entry.src);
    invariant(Number.isInteger(entry.width) && Number.isInteger(entry.height), `${entry.id}: dimensions entières requises`);
    validateDimensions(entry);
    invariant(typeof entry.alpha === 'boolean', `${entry.id}: contrat alpha manquant`);
    invariant(Number.isInteger(entry.bytes) && entry.bytes > 0, `${entry.id}: budget bytes invalide`);
    invariant(entry.bytes <= CATEGORY_BUDGETS[entry.kind], `${entry.id}: budget individuel dépassé (${entry.bytes})`);
    invariant(/^[a-f0-9]{64}$/.test(entry.sha256), `${entry.id}: SHA-256 invalide`);

    const file = resolve(root, entry.src);
    const bytes = await readFile(file);
    invariant(bytes.length === entry.bytes, `${entry.id}: taille catalogue ${entry.bytes}, fichier ${bytes.length}`);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    invariant(sha256 === entry.sha256, `${entry.id}: SHA-256 différent du catalogue`);
    const metadata = readWebpMetadata(bytes, entry.id);
    invariant(metadata.width === entry.width && metadata.height === entry.height, `${entry.id}: dimensions WebP ${metadata.width}x${metadata.height}, catalogue ${entry.width}x${entry.height}`);
    invariant(metadata.alpha === entry.alpha, `${entry.id}: alpha WebP ${metadata.alpha}, catalogue ${entry.alpha}`);
    if (entry.alpha) alphaCount += 1;
    else opaqueCount += 1;
    totalBytes += bytes.length;
    verified.push({ ...entry, file, sha256, chunk: metadata.chunk });
  }

  invariant(alphaCount === EXPECTED_COUNTS.alpha, `${EXPECTED_COUNTS.alpha} assets alpha attendus, reçu ${alphaCount}`);
  invariant(opaqueCount === EXPECTED_COUNTS.opaque, `${EXPECTED_COUNTS.opaque} assets opaques attendus, reçu ${opaqueCount}`);
  invariant(totalBytes <= ASSET_BUDGET_BYTES, `Budget runtime dépassé: ${totalBytes} / ${ASSET_BUDGET_BYTES}`);

  const expectedSummary = {
    masters: EXPECTED_COUNTS.masters,
    runtimeFiles: EXPECTED_COUNTS.runtimeFiles,
    arenaLayers: EXPECTED_COUNTS.arenaLayers,
    bossParts: EXPECTED_COUNTS.bossParts,
    heroineParts: EXPECTED_COUNTS.heroineParts,
    vfx: EXPECTED_COUNTS.vfx,
    totalBytes,
  };
  for (const [key, expected] of Object.entries(expectedSummary)) {
    invariant(manifest.summary?.[key] === expected, `Résumé ${key}: attendu ${expected}, reçu ${manifest.summary?.[key]}`);
  }

  const actualRuntimeFiles = (await listFiles(runtimeRoot))
    .map(file => relative(root, file).replaceAll('\\', '/'))
    .sort();
  const expectedRuntimeFiles = [ASSET_MANIFEST_PATH, ...sources].sort();
  invariant(JSON.stringify(actualRuntimeFiles) === JSON.stringify(expectedRuntimeFiles), 'Le dossier runtime contient un fichier absent du catalogue ou il manque un asset déclaré.');

  return { manifest, entries: verified, totalBytes, alphaCount, opaqueCount, files: expectedRuntimeFiles };
}
