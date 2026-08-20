import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';

const [packageJson, manifest, serviceWorker, vercel] = await Promise.all([
  readFile('package.json', 'utf8').then(JSON.parse),
  readFile('manifest.webmanifest', 'utf8').then(JSON.parse),
  readFile('sw.js', 'utf8'),
  readFile('vercel.json', 'utf8').then(JSON.parse),
]);

assert.equal(packageJson.version, '2.1.0');
assert.equal(manifest.name, 'GEARSTORM: Boss Circuit');
assert.equal(manifest.short_name, 'GEARSTORM');
assert.ok(['fullscreen', 'standalone'].includes(manifest.display));
assert.ok(manifest.icons.some(icon => icon.purpose.split(/\s+/).includes('maskable')));
assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));
assert.ok(manifest.icons.some(icon => icon.sizes === '512x512'));
assert.ok(manifest.screenshots?.some(screenshot => screenshot.src.includes('gearstorm-key-art.png')));

const expectedPublicFiles = [
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
for (const file of expectedPublicFiles) await access(file);

const assets = (await readdir('dist/assets')).sort();
assert.deepEqual(assets, ['gearstorm-icon-192.png', 'gearstorm-icon-512.png', 'gearstorm-icon.svg', 'gearstorm-key-art.png']);

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

for (const asset of ['./index.html', './styles.css', './game.js', './manifest.webmanifest', './assets/gearstorm-icon.svg', './assets/gearstorm-icon-192.png', './assets/gearstorm-icon-512.png', './assets/gearstorm-key-art.png']) {
  assert.ok(serviceWorker.includes(asset), `Asset absent du cache PWA : ${asset}`);
}
assert.ok(serviceWorker.includes(`v${packageJson.version}`), 'La version du cache PWA doit suivre package.json.');

const art = await readFile('dist/assets/gearstorm-key-art.png');
assert.ok(art.length > 100_000, 'Le key art final est absent ou trop petit.');
assert.deepEqual([...art.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'Le key art doit être un PNG valide.');
const width = art.readUInt32BE(16);
const height = art.readUInt32BE(20);
assert.ok(width >= 1200 && height >= 675, `Key art insuffisant : ${width}x${height}.`);

const icon = await stat('dist/assets/gearstorm-icon.svg');
assert.ok(icon.size > 500, 'L’icône PWA SVG est absente ou incomplète.');
for (const [file, expectedSize] of [['dist/assets/gearstorm-icon-192.png', 192], ['dist/assets/gearstorm-icon-512.png', 512]]) {
  const png = await readFile(file);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'Invalid PNG icon: ' + file);
  assert.equal(png.readUInt32BE(16), expectedSize);
  assert.equal(png.readUInt32BE(20), expectedSize);
}


const buildManifest = JSON.parse(await readFile('dist/build-manifest.json', 'utf8'));
assert.equal(buildManifest.version, packageJson.version);
for (const path of ['index.html', 'styles.css', 'game.js', 'manifest.webmanifest', 'sw.js', 'assets/gearstorm-icon.svg', 'assets/gearstorm-icon-192.png', 'assets/gearstorm-icon-512.png', 'assets/gearstorm-key-art.png']) {
  assert.match(buildManifest.files[path]?.sha256 || '', /^[a-f0-9]{64}$/);
  assert.ok(buildManifest.files[path].bytes > 0);
}

assert.equal(vercel.buildCommand, 'npm run build');
assert.equal(vercel.outputDirectory, 'dist');
const commonHeaders = vercel.headers.find(rule => rule.source === '/(.*)')?.headers || [];
assert.ok(commonHeaders.some(header => header.key === 'Content-Security-Policy'));
assert.ok(commonHeaders.some(header => header.key === 'X-Content-Type-Options' && header.value === 'nosniff'));
assert.ok(!JSON.stringify(vercel).includes('immutable'), 'Les assets non fingerprintés ne doivent pas être marqués immutable.');

console.log(`Release web ${packageJson.version} vérifiée : PWA, assets, sécurité et bundle public minimal.`);
