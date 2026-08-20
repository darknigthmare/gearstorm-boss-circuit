import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import {
  ASSET_BUDGET_BYTES,
  ASSET_DIRECTORY,
  ASSET_MANIFEST_PATH,
  ASSET_RELEASE,
  EXPECTED_COUNTS,
  validateRuntimeAssets,
} from './asset-contract.mjs';

const [packageJson, manifest, serviceWorker, vercel, sourceRuntime] = await Promise.all([
  readFile('package.json', 'utf8').then(JSON.parse),
  readFile('manifest.webmanifest', 'utf8').then(JSON.parse),
  readFile('sw.js', 'utf8'),
  readFile('vercel.json', 'utf8').then(JSON.parse),
  validateRuntimeAssets(),
]);

assert.equal(packageJson.version, ASSET_RELEASE);
assert.equal(manifest.name, 'GEARSTORM: Boss Circuit');
assert.equal(manifest.short_name, 'GEARSTORM');
assert.ok(['fullscreen', 'standalone'].includes(manifest.display));
assert.ok(manifest.icons.some(icon => icon.purpose.split(/\s+/).includes('maskable')));
assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));
assert.ok(manifest.icons.some(icon => icon.sizes === '512x512'));
const keyArtScreenshot = manifest.screenshots?.find(screenshot => screenshot.src.includes('gearstorm-key-art.png'));
assert.equal(keyArtScreenshot?.sizes, '1672x941');

const shellFiles = [
  'dist/index.html',
  'dist/styles.css',
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

const distRuntime = await validateRuntimeAssets('dist');
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

const topLevel = (await readdir('dist')).sort();
assert.deepEqual(topLevel, [
  'assets',
  'build-manifest.json',
  'game.js',
  'index.html',
  'manifest.webmanifest',
  'styles.css',
  'sw.js',
]);
for (const forbidden of ['README.md', 'QA_REPORT.md', 'LANCER_LE_JEU.bat', 'standalone.html']) {
  assert.ok(!topLevel.includes(forbidden), `${forbidden} ne doit pas être publié par Vercel.`);
}

for (const asset of ['./index.html', './styles.css', './game.js', './manifest.webmanifest', './assets/gearstorm-icon.svg', './assets/gearstorm-icon-192.png', './assets/gearstorm-icon-512.png', './assets/gearstorm-key-art.png', `./${ASSET_MANIFEST_PATH}`]) {
  assert.ok(serviceWorker.includes(asset), `Asset shell absent du cache PWA : ${asset}`);
}
assert.ok(serviceWorker.includes(`gearstorm-shell-v${ASSET_RELEASE}`));
assert.ok(serviceWorker.includes(`gearstorm-runtime-v${ASSET_RELEASE}`));
assert.match(serviceWorker, /GENERATED_RUNTIME_PREFIX/);
assert.match(serviceWorker, /contentType[\s\S]+webp/);
const coreAssetsBlock = serviceWorker.slice(serviceWorker.indexOf('const CORE_ASSETS'), serviceWorker.indexOf('self.addEventListener'));
assert.doesNotMatch(coreAssetsBlock, /assets\/generated\/v2\.2\.0\/.+\.webp/);

const art = await readFile('dist/assets/gearstorm-key-art.png');
assert.ok(art.length > 100_000, 'Le key art final est absent ou trop petit.');
assert.deepEqual([...art.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'Le key art doit être un PNG valide.');
assert.equal(art.readUInt32BE(16), 1672);
assert.equal(art.readUInt32BE(20), 941);

const icon = await stat('dist/assets/gearstorm-icon.svg');
assert.ok(icon.size > 500, 'L’icône PWA SVG est absente ou incomplète.');
for (const [file, expectedSize] of [['dist/assets/gearstorm-icon-192.png', 192], ['dist/assets/gearstorm-icon-512.png', 512]]) {
  const png = await readFile(file);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'Icône PNG invalide : ' + file);
  assert.equal(png.readUInt32BE(16), expectedSize);
  assert.equal(png.readUInt32BE(20), expectedSize);
}

const buildManifest = JSON.parse(await readFile('dist/build-manifest.json', 'utf8'));
assert.equal(buildManifest.version, packageJson.version);
assert.deepEqual(buildManifest.runtimeAssets, {
  release: ASSET_RELEASE,
  files: EXPECTED_COUNTS.runtimeFiles,
  alpha: EXPECTED_COUNTS.alpha,
  opaque: EXPECTED_COUNTS.opaque,
  totalBytes: sourceRuntime.totalBytes,
  budgetBytes: ASSET_BUDGET_BYTES,
});
assert.equal(Object.keys(buildManifest.files).length, 5 + 4 + 1 + EXPECTED_COUNTS.runtimeFiles);
for (const path of ['index.html', 'styles.css', 'game.js', 'manifest.webmanifest', 'sw.js', 'assets/gearstorm-icon.svg', 'assets/gearstorm-icon-192.png', 'assets/gearstorm-icon-512.png', 'assets/gearstorm-key-art.png', ASSET_MANIFEST_PATH]) {
  assert.match(buildManifest.files[path]?.sha256 || '', /^[a-f0-9]{64}$/);
  assert.ok(buildManifest.files[path].bytes > 0);
}
for (const asset of sourceRuntime.entries) {
  assert.equal(buildManifest.files[asset.src]?.sha256, asset.sha256);
  assert.equal(buildManifest.files[asset.src]?.bytes, asset.bytes);
}

assert.equal(vercel.buildCommand, 'npm run build');
assert.equal(vercel.outputDirectory, 'dist');
const commonHeaders = vercel.headers.find(rule => rule.source === '/(.*)')?.headers || [];
assert.ok(commonHeaders.some(header => header.key === 'Content-Security-Policy'));
assert.ok(commonHeaders.some(header => header.key === 'X-Content-Type-Options' && header.value === 'nosniff'));
const generatedHeaders = vercel.headers.find(rule => rule.source === '/assets/generated/v2.2.0/(.*)')?.headers || [];
assert.ok(generatedHeaders.some(header => header.key === 'Cache-Control' && header.value === 'public, max-age=31536000, immutable'));

console.log(`Release web ${packageJson.version} vérifiée : ${sourceRuntime.entries.length} assets WebP, ${sourceRuntime.totalBytes} octets, PWA et sécurité conformes.`);
