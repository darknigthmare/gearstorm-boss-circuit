import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
if (dirname(dist) !== root) throw new Error('Répertoire de build non sécurisé.');

const publicFiles = ['index.html', 'styles.css', 'game.js', 'manifest.webmanifest', 'sw.js'];
const publicAssets = ['gearstorm-icon.svg', 'gearstorm-icon-192.png', 'gearstorm-icon-512.png', 'gearstorm-key-art.png'];
const [html, game, packageJson] = await Promise.all([
  readFile(resolve(root, 'index.html'), 'utf8'),
  readFile(resolve(root, 'game.js'), 'utf8'),
  readFile(resolve(root, 'package.json'), 'utf8').then(JSON.parse),
]);

for (const id of [...game.matchAll(/getElementById\('([^']+)'\)/g)].map(match => match[1])) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Identifiant DOM manquant : ${id}`);
}
if (!/rel=["']manifest["'][^>]+manifest\.webmanifest/.test(html)) {
  throw new Error('Le manifeste PWA n’est pas relié dans index.html.');
}
if (!/serviceWorker/.test(game)) {
  throw new Error('Le service worker PWA n’est pas enregistré par game.js.');
}

await Promise.all([
  ...publicFiles.map(file => stat(resolve(root, file))),
  ...publicAssets.map(file => stat(resolve(root, 'assets', file))),
]);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all(publicFiles.map(file => copyFile(resolve(root, file), resolve(dist, file))));
await mkdir(resolve(dist, 'assets'), { recursive: true });
await Promise.all(publicAssets.map(file => copyFile(resolve(root, 'assets', file), resolve(dist, 'assets', file))));

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }));
  return nested.flat();
}

const emittedFiles = (await listFiles(dist)).sort();
const files = {};
for (const file of emittedFiles) {
  const bytes = await readFile(file);
  files[relative(dist, file).replaceAll('\\', '/')] = {
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

await writeFile(resolve(dist, 'build-manifest.json'), JSON.stringify({
  name: 'GEARSTORM: Boss Circuit',
  version: packageJson.version,
  files,
}, null, 2) + '\n', 'utf8');

console.log(`Build web ${packageJson.version} prêt : ${dist}`);
