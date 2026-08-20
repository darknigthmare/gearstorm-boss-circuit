import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import {
  APP_RELEASE,
  DIST_BUDGET_BYTES,
  MASTERY_CONTRACT_COUNT,
  SAVE_SCHEMA_VERSION,
  STORY_CONTENT_VERSION,
  STORY_SCHEMA_VERSION,
  validateApplicationContract,
} from './app-contract.mjs';
import {
  ASSET_BUDGET_BYTES,
  ASSET_DIRECTORY,
  ASSET_MANIFEST_PATH,
  ASSET_RELEASE,
  EXPECTED_COUNTS,
  validateRuntimeAssets,
} from './asset-contract.mjs';
import { validateInfrastructureContract } from './infrastructure-contract.mjs';

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    assert.equal(entry.isSymbolicLink(), false, `Lien symbolique interdit dans dist : ${entry.name}`);
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }));
  return nested.flat();
}

const [
  packageJson,
  packageLock,
  html,
  story,
  game,
  manifest,
  serviceWorker,
  vercel,
  vercelIgnore,
  ci,
  sourceRuntime,
] = await Promise.all([
  readFile('package.json', 'utf8').then(JSON.parse),
  readFile('package-lock.json', 'utf8').then(JSON.parse),
  readFile('index.html', 'utf8'),
  readFile('story.js', 'utf8'),
  readFile('game.js', 'utf8'),
  readFile('manifest.webmanifest', 'utf8').then(JSON.parse),
  readFile('sw.js', 'utf8'),
  readFile('vercel.json', 'utf8').then(JSON.parse),
  readFile('.vercelignore', 'utf8'),
  readFile('.github/workflows/ci.yml', 'utf8'),
  validateRuntimeAssets(),
]);

assert.equal(packageJson.version, APP_RELEASE);
assert.equal(packageLock.version, APP_RELEASE);
assert.equal(packageLock.packages?.['']?.version, APP_RELEASE);
assert.equal(packageLock.lockfileVersion, 3);
validateApplicationContract({ game, story, html, manifest, packageJson });
validateInfrastructureContract({ ci, serviceWorker, vercel, vercelIgnore });

assert.equal(manifest.name, 'GEARSTORM: Boss Circuit');
assert.equal(manifest.short_name, 'GEARSTORM');
assert.ok(['fullscreen', 'standalone'].includes(manifest.display));
assert.equal(manifest.launch_handler?.client_mode, 'navigate-existing');
assert.ok(manifest.icons.some(icon => icon.purpose.split(/\s+/).includes('maskable')));
assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));
assert.ok(manifest.icons.some(icon => icon.sizes === '512x512'));
assert.ok(manifest.shortcuts.every(shortcut => shortcut.icons?.some(icon => icon.sizes === '192x192')));
const keyArtScreenshot = manifest.screenshots?.find(screenshot => screenshot.src.includes('gearstorm-key-art.png'));
assert.equal(keyArtScreenshot?.sizes, '1672x941');

const shellFiles = [
  'dist/index.html',
  'dist/styles.css',
  'dist/story.js',
  'dist/game.js',
  'dist/manifest.webmanifest',
  'dist/sw.js',
  'dist/assets/gearstorm-icon.svg',
  'dist/assets/gearstorm-icon-192.png',
  'dist/assets/gearstorm-icon-512.png',
  'dist/assets/gearstorm-key-art.png',
  'dist/build-manifest.json',
];
for (const file of shellFiles) await access(file);

const [distHtml, distStory, distGame, distManifest, distRuntime] = await Promise.all([
  readFile('dist/index.html', 'utf8'),
  readFile('dist/story.js', 'utf8'),
  readFile('dist/game.js', 'utf8'),
  readFile('dist/manifest.webmanifest', 'utf8').then(JSON.parse),
  validateRuntimeAssets('dist'),
]);
validateApplicationContract({ game: distGame, story: distStory, html: distHtml, manifest: distManifest, packageJson });
assert.equal(distRuntime.entries.length, EXPECTED_COUNTS.runtimeFiles);
assert.equal(distRuntime.totalBytes, sourceRuntime.totalBytes);
assert.ok(distRuntime.totalBytes <= ASSET_BUDGET_BYTES);

assert.deepEqual((await readdir('dist/assets')).sort(), [
  'gearstorm-icon-192.png',
  'gearstorm-icon-512.png',
  'gearstorm-icon.svg',
  'gearstorm-key-art.png',
  'generated',
]);
assert.deepEqual((await readdir('dist/assets/generated')).sort(), [ASSET_DIRECTORY]);
assert.deepEqual((await readdir('dist')).sort(), [
  'assets',
  'build-manifest.json',
  'game.js',
  'index.html',
  'manifest.webmanifest',
  'story.js',
  'styles.css',
  'sw.js',
]);

const art = await readFile('dist/assets/gearstorm-key-art.png');
assert.ok(art.length > 100_000, 'Key art final absent ou trop petit.');
assert.deepEqual([...art.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'Key art PNG invalide.');
assert.equal(art.readUInt32BE(16), 1672);
assert.equal(art.readUInt32BE(20), 941);

const icon = await stat('dist/assets/gearstorm-icon.svg');
assert.ok(icon.size > 500, 'Icone PWA SVG absente ou incomplete.');
for (const [file, expectedSize] of [['dist/assets/gearstorm-icon-192.png', 192], ['dist/assets/gearstorm-icon-512.png', 512]]) {
  const png = await readFile(file);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'Icone PNG invalide : ' + file);
  assert.equal(png.readUInt32BE(16), expectedSize);
  assert.equal(png.readUInt32BE(20), expectedSize);
}

const buildManifest = JSON.parse(await readFile('dist/build-manifest.json', 'utf8'));
assert.equal(buildManifest.schemaVersion, 3);
assert.equal(buildManifest.version, APP_RELEASE);
assert.deepEqual(buildManifest.application, {
  release: APP_RELEASE,
  saveSchemaVersion: SAVE_SCHEMA_VERSION,
  storySchemaVersion: STORY_SCHEMA_VERSION,
  storyContentVersion: STORY_CONTENT_VERSION,
  masteryContracts: MASTERY_CONTRACT_COUNT,
});
assert.deepEqual(buildManifest.runtimeAssets, {
  release: ASSET_RELEASE,
  files: EXPECTED_COUNTS.runtimeFiles,
  alpha: EXPECTED_COUNTS.alpha,
  opaque: EXPECTED_COUNTS.opaque,
  totalBytes: sourceRuntime.totalBytes,
  budgetBytes: ASSET_BUDGET_BYTES,
});

const actualFiles = (await listFiles('dist'))
  .map(file => relative(resolve('dist'), file).replaceAll('\\', '/'))
  .sort();
const declaredFiles = Object.keys(buildManifest.files).sort();
assert.deepEqual(actualFiles, [...declaredFiles, 'build-manifest.json'].sort(), 'dist et build-manifest divergent.');
assert.equal(declaredFiles.length, 6 + 4 + 1 + EXPECTED_COUNTS.runtimeFiles);

let distBytes = 0;
for (const path of actualFiles) {
  const bytes = await readFile(resolve('dist', path));
  distBytes += bytes.length;
  assert.ok(bytes.length > 0, `Fichier vide interdit : ${path}`);
  assert.doesNotMatch(path, /(?:^|\/)\.(?:env|git)|\.(?:map|md|psd|py|tmp|zip)$/i);
  assert.doesNotMatch(path, /^assets\/generated\/(?:arenas|bosses|riva|vfx)\//);
  if (path === 'build-manifest.json') continue;
  assert.equal(buildManifest.files[path]?.bytes, bytes.length, `Taille incoherente : ${path}`);
  assert.equal(
    buildManifest.files[path]?.sha256,
    createHash('sha256').update(bytes).digest('hex'),
    `SHA-256 incoherent : ${path}`,
  );
}
assert.ok(distBytes <= DIST_BUDGET_BYTES, `Budget dist depasse : ${distBytes} / ${DIST_BUDGET_BYTES}`);

console.log(`Release web ${APP_RELEASE} verifiee : assets v${ASSET_RELEASE}, ${sourceRuntime.entries.length} WebP, ${MASTERY_CONTRACT_COUNT} contrats, ${distBytes} octets publies, PWA/CI/securite conformes.`);
