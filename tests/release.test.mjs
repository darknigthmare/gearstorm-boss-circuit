import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  APP_RELEASE,
  CAMPAIGN_BOSS_COUNT,
  DIST_BUDGET_BYTES,
  EXPANSION_MASTERY_CONTRACT_COUNT,
  FORGE_BOSS_COUNT,
  EXPANSION_STORY_CONTENT_VERSION,
  MASTERY_CONTRACT_COUNT,
  PHASE_COUNT,
  PLAYABLE_BOSS_COUNT,
  SAVE_SCHEMA_VERSION,
  STORY_CONTENT_VERSION,
  STORY_MASTERY_CONTRACT_COUNT,
  STORY_SCHEMA_VERSION,
} from '../scripts/app-contract.mjs';
import {
  ASSET_BUDGET_BYTES,
  ASSET_RELEASE,
} from '../scripts/asset-contract.mjs';
import { validateInfrastructureContract } from '../scripts/infrastructure-contract.mjs';

const [packageJson, manifest, serviceWorker, vercel, vercelIgnore, ci, buildScript, releaseScript, pwaBootstrap, indexHtml] = await Promise.all([
  readFile('package.json', 'utf8').then(JSON.parse),
  readFile('manifest.webmanifest', 'utf8').then(JSON.parse),
  readFile('sw.js', 'utf8'),
  readFile('vercel.json', 'utf8').then(JSON.parse),
  readFile('.vercelignore', 'utf8'),
  readFile('.github/workflows/ci.yml', 'utf8'),
  readFile('scripts/build.mjs', 'utf8'),
  readFile('scripts/check-release.mjs', 'utf8'),
  readFile('pwa-update-v2.10.0.js', 'utf8'),
  readFile('index.html', 'utf8'),
]);

test('la version application, les contenus et le pack OpenAI convergent en 2.10', () => {
  assert.equal(packageJson.version, APP_RELEASE);
  assert.equal(APP_RELEASE, '2.10.0');
  assert.equal(ASSET_RELEASE, '2.10.0');
  assert.equal(STORY_CONTENT_VERSION, '2.10.0');
  assert.equal(EXPANSION_STORY_CONTENT_VERSION, '2.10.0');
  assert.match(buildScript, /packageJson\.version !== APP_RELEASE/);
  assert.match(buildScript, /release: ASSET_RELEASE/);
  assert.match(buildScript, new RegExp(`saveSchemaVersion:\\s*SAVE_SCHEMA_VERSION`));
  assert.equal(SAVE_SCHEMA_VERSION, 5);
  assert.equal(STORY_SCHEMA_VERSION, 1);
  assert.equal(STORY_CONTENT_VERSION, '2.10.0');
  assert.equal(CAMPAIGN_BOSS_COUNT, 6);
  assert.equal(FORGE_BOSS_COUNT, 24);
  assert.equal(PLAYABLE_BOSS_COUNT, 30);
  assert.equal(PHASE_COUNT, 90);
  assert.equal(STORY_MASTERY_CONTRACT_COUNT, 18);
  assert.equal(EXPANSION_MASTERY_CONTRACT_COUNT, 72);
  assert.equal(MASTERY_CONTRACT_COUNT, 90);
});

test('le build reste une liste blanche reproductible et minimale', () => {
  assert.match(buildScript, /const publicFiles = \['index\.html', 'pwa-update-v2\.10\.0\.js', 'styles\.css', 'story\.js', 'expansion-story\.js', 'boss-roster\.js', 'game\.js', 'manifest\.webmanifest', 'sw\.js'\]/);
  assert.match(buildScript, /const shellAssets = \['gearstorm-icon\.svg', 'gearstorm-icon-192\.png', 'gearstorm-icon-512\.png', 'gearstorm-key-art\.png'\]/);
  assert.match(buildScript, /\.\.\.runtimeAssets\.files/);
  assert.match(buildScript, /validateApplicationContract/);
  assert.match(buildScript, /schemaVersion: 4/);
  assert.doesNotMatch(buildScript, /LANCER_LE_JEU|QA_REPORT|README\.md/);
  assert.doesNotMatch(buildScript, /cp\(resolve\(root, 'assets'/);
  assert.ok(DIST_BUDGET_BYTES > ASSET_BUDGET_BYTES);
  assert.match(releaseScript, /distBytes <= DIST_BUDGET_BYTES/);
  assert.match(releaseScript, /SHA-256 incoherent/);
});

test('la PWA est installable, versionnee et ne precache pas tout le pack runtime', () => {
  assert.equal(manifest.name, 'GEARSTORM: Boss Circuit');
  assert.equal(manifest.launch_handler?.client_mode, 'navigate-existing');
  assert.ok(manifest.icons.some(icon => icon.purpose.includes('maskable')));
  assert.ok(manifest.shortcuts.every(shortcut => shortcut.icons?.some(icon => icon.sizes === '192x192')));
  const keyArt = manifest.screenshots.find(screenshot => screenshot.src.includes('gearstorm-key-art.png'));
  assert.equal(keyArt?.sizes, '1672x941');
  assert.ok(manifest.shortcuts.some(shortcut => shortcut.url === './?mode=forge'));
  assert.ok(manifest.shortcuts.some(shortcut => shortcut.url === './?mode=forgeRush'));
  assert.match(serviceWorker, /const APP_VERSION = '2\.10\.0'/);
  assert.match(serviceWorker, /'\.\/story\.js'/);
  assert.match(serviceWorker, /'\.\/expansion-story\.js'/);
  assert.match(serviceWorker, /'\.\/boss-roster\.js'/);
  assert.match(serviceWorker, /'\.\/pwa-update-v2\.10\.0\.js'/);
  assert.match(serviceWorker, /const ASSET_VERSION = '2\.10\.0'/);
  assert.match(serviceWorker, /cacheFirstRuntime/);
  assert.match(serviceWorker, /staleWhileRevalidateShell/);
  assert.match(serviceWorker, /networkFirstNavigation/);
  const coreAssets = serviceWorker.slice(serviceWorker.indexOf('const CORE_ASSETS'), serviceWorker.indexOf('const CORE_PATHS'));
  assert.doesNotMatch(coreAssets, /\.webp/);
  assert.ok(indexHtml.indexOf('pwa-update-v2.10.0.js') < indexHtml.indexOf('game.js'));
  assert.match(pwaBootstrap, /__GEARSTORM_PWA_UPDATE_V2_10_0__/);
  assert.match(pwaBootstrap, /registration\.waiting/);
  assert.match(pwaBootstrap, /SKIP_WAITING/);
  assert.match(pwaBootstrap, /controllerchange/);
});

test('Vercel, la CI Linux et les exclusions satisfont le contrat infrastructure', () => {
  assert.doesNotThrow(() => validateInfrastructureContract({ ci, serviceWorker, vercel, vercelIgnore }));
  assert.match(ci, /concurrency:[\s\S]+cancel-in-progress: true/);
  assert.match(ci, /name: gearstorm-web-v2\.10\.0/);
  assert.match(ci, /name: gearstorm-playwright-v2\.10\.0/);
  assert.match(vercelIgnore, /^\.env\*$/m);
  assert.match(vercelIgnore, /^assets\/generated\/v2\.7\.0\/$/m);
  assert.match(vercelIgnore, /^assets\/generated\/v2\.9\.1\/$/m);
  assert.doesNotMatch(vercelIgnore, /^assets\/generated\/v2\.10\.0\/$/m);
});

test('les scripts npm couvrent syntaxe, tests, build et verification release', () => {
  assert.match(packageJson.scripts.check, /node --check expansion-story\.js/);
  assert.match(packageJson.scripts.check, /node --check boss-roster\.js/);
  assert.match(packageJson.scripts.check, /node --check pwa-update-v2\.10\.0\.js/);
  assert.match(packageJson.scripts.check, /node --check sw\.js/);
  assert.match(packageJson.scripts.check, /scripts\/app-contract\.mjs/);
  assert.match(packageJson.scripts.check, /scripts\/infrastructure-contract\.mjs/);
  assert.match(packageJson.scripts.test, /tests\/expansion-story\.test\.mjs/);
  assert.match(packageJson.scripts.test, /tests\/release\.test\.mjs/);
  assert.match(packageJson.scripts.test, /tests\/sw\.test\.mjs/);
  assert.match(packageJson.scripts.test, /tests\/pwa-update\.test\.mjs/);
  assert.equal(packageJson.scripts.qa, 'npm run check && npm test && npm run build && npm run check:release');
  assert.equal(packageJson.scripts['test:e2e'], 'playwright test --project=chromium-desktop --project=chromium-mobile');
  assert.equal(packageJson.scripts['test:e2e:cross-browser'], 'playwright test --project=firefox-desktop --project=webkit-desktop');
  assert.equal(packageJson.engines.node, '22.x');
  assert.equal(packageJson.scripts['qa:ci'], 'npm run qa && npm run test:e2e');
  assert.match(ci, /playwright install --with-deps chromium/);
  assert.match(ci, /npm run test:e2e/);
});
