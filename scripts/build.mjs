import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ASSET_BUDGET_BYTES,
  ASSET_RELEASE,
  validateRuntimeAssets,
} from './asset-contract.mjs';
import {
  APP_RELEASE,
  SAVE_SCHEMA_VERSION,
  validateApplicationContract,
} from './app-contract.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
if (dirname(dist) !== root) throw new Error('Répertoire de build non sécurisé.');

const publicFiles = ['index.html', 'styles.css', 'game.js', 'manifest.webmanifest', 'sw.js'];
const shellAssets = ['gearstorm-icon.svg', 'gearstorm-icon-192.png', 'gearstorm-icon-512.png', 'gearstorm-key-art.png'];
const [html, game, manifest, packageJson, runtimeAssets] = await Promise.all([
  readFile(resolve(root, 'index.html'), 'utf8'),
  readFile(resolve(root, 'game.js'), 'utf8'),
  readFile(resolve(root, 'manifest.webmanifest'), 'utf8').then(JSON.parse),
  readFile(resolve(root, 'package.json'), 'utf8').then(JSON.parse),
  validateRuntimeAssets(root),
]);

if (packageJson.version !== APP_RELEASE) {
  throw new Error(`Version package ${packageJson.version}, application ${APP_RELEASE}.`);
}
validateApplicationContract({ game, html, manifest, packageJson });
for (const id of [...game.matchAll(/getElementById\('([^']+)'\)/g)].map(match => match[1])) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Identifiant DOM manquant : ${id}`);
}
if (!/rel=["']manifest["'][^>]+manifest\.webmanifest/.test(html)) {
  throw new Error('Le manifeste PWA n’est pas relié dans index.html.');
}
if (!/serviceWorker/.test(game)) {
  throw new Error('Le service worker PWA n’est pas enregistré par game.js.');
}

const emittedInputs = [
  ...publicFiles,
  ...shellAssets.map(file => `assets/${file}`),
  ...runtimeAssets.files,
];
if (new Set(emittedInputs).size !== emittedInputs.length) {
  throw new Error('Un fichier public est déclaré plusieurs fois.');
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await Promise.all(emittedInputs.map(async file => {
  const source = resolve(root, file);
  const destination = resolve(dist, file);
  if (!destination.startsWith(dist + sep) && destination !== dist) throw new Error(`Destination non sécurisée : ${file}`);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}));

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
  schemaVersion: 2,
  name: 'GEARSTORM: Boss Circuit',
  version: packageJson.version,
  application: {
    release: APP_RELEASE,
    saveSchemaVersion: SAVE_SCHEMA_VERSION,
  },
  runtimeAssets: {
    release: ASSET_RELEASE,
    files: runtimeAssets.entries.length,
    alpha: runtimeAssets.alphaCount,
    opaque: runtimeAssets.opaqueCount,
    totalBytes: runtimeAssets.totalBytes,
    budgetBytes: ASSET_BUDGET_BYTES,
  },
  files,
}, null, 2) + '\n', 'utf8');

console.log(`Build web ${APP_RELEASE} prêt : ${dist} (${runtimeAssets.entries.length} assets runtime, ${runtimeAssets.totalBytes} octets)`);
