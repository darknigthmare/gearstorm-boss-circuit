import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [html, css, game, readme, design, packageJson, manifest, serviceWorker, vercel, buildScript] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('styles.css', 'utf8'),
  readFile('game.js', 'utf8'),
  readFile('README.md', 'utf8'),
  readFile('DESIGN.md', 'utf8'),
  readFile('package.json', 'utf8').then(JSON.parse),
  readFile('manifest.webmanifest', 'utf8').then(JSON.parse),
  readFile('sw.js', 'utf8'),
  readFile('vercel.json', 'utf8').then(JSON.parse),
  readFile('scripts/build.mjs', 'utf8'),
]);

test('la marque et les six boss GEARSTORM sont présents', () => {
  assert.match(html, /GEARSTORM/);
  for (const name of ['RIVET REX', 'SKY SLICER', 'MAGNETRON', 'CHRONO MANTIS', 'FOUNDRY TITAN', 'CROWN ENGINE Ω']) {
    assert.match(game, new RegExp(name));
  }
  assert.equal([...game.matchAll(/^\s+id: '(rammer|kraken|drill|mantis|cyclotron|omega)'/gm)].length, 6);
  assert.doesNotMatch(html + readme + design, /GEARGRIN|PROTOTYPE JOUABLE/);
});

test('tous les identifiants DOM utilisés par le moteur existent', () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));
  const references = [...game.matchAll(/getElementById\('([^']+)'\)/g)].map(match => match[1]);
  assert.ok(references.length > 20);
  for (const id of references) assert.ok(ids.has(id), `id manquant: ${id}`);
});

test('les systèmes campagne, entrées et accessibilité sont câblés', () => {
  for (const marker of ['showUpgradeSelection', 'activateOverload', 'navigator.getGamepads', 'pointer.attack', "touchWasPressed('overload')", 'showEnding', 'gearstorm_boss_circuit_save_v2']) {
    assert.match(game, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(css, /\.upgrade-grid/);
  assert.match(html, /id="upgrade-screen"/);
  assert.match(html, /id="prologue-screen"/);
  assert.ok(game.includes("document.getElementById('start-rush').addEventListener('click',()=>showScreen('prologue-screen'));"));
  assert.ok(game.includes("document.getElementById('prologue-start')?.addEventListener('click',()=>startRun('rush',0));"));
  assert.match(html, /id="ending-screen"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /prefers-reduced-motion|motion-toggle/);
});

test('les chronos, retry et sauvegardes suivent les garde-fous', () => {
  assert.match(game, /lastBossTime = currentBossElapsed/);
  assert.match(game, /startFight\(currentBossIndex, \{ retry: true \}\)/);
  assert.match(game, /if \(boss\.defeated\) return/);
  assert.match(game, /Number\.isFinite\(parsed\?\.bestRush\)/);
  assert.match(game, /Object\.hasOwn\(DIFFICULTIES/);
  assert.match(game, /const elapsed=currentBossElapsed/);
  assert.doesNotMatch(game, /const elapsed=performance\.now/);
  assert.match(game, /qaAllowed[\s\S]+__GEARSTORM_QA__/);
});

test('la PWA est reliée, installable et versionnée', () => {
  assert.equal(packageJson.version, '2.1.0');
  assert.match(html, /rel="manifest" href="manifest\.webmanifest"/);
  assert.match(html, /property="og:image"/);
  assert.match(game, /serviceWorker/);
  assert.equal(manifest.name, 'GEARSTORM: Boss Circuit');
  assert.ok(manifest.icons.some(icon => icon.purpose.includes('maskable')));
  assert.ok(manifest.screenshots.some(screenshot => screenshot.src.includes('gearstorm-key-art.png')));
  assert.match(serviceWorker, /gearstorm-shell-v2\.1\.0/);
  assert.match(serviceWorker, /skipWaiting/);
});

test('la chaîne Vercel publie uniquement le runtime web', () => {
  assert.equal(vercel.buildCommand, 'npm run build');
  assert.equal(vercel.outputDirectory, 'dist');
  assert.match(buildScript, /const publicFiles = \['index\.html', 'styles\.css', 'game\.js', 'manifest\.webmanifest', 'sw\.js'\]/);
  assert.doesNotMatch(buildScript, /LANCER_LE_JEU|QA_REPORT|README\.md/);
  assert.ok(vercel.headers.some(rule => rule.source === '/(.*)'));
});
