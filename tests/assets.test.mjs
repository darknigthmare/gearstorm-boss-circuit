import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  ASSET_BUDGET_BYTES,
  ASSET_MANIFEST_PATH,
  ASSET_RELEASE,
  BOSS_IDS,
  EXPECTED_COUNTS,
  validateRuntimeAssets,
} from '../scripts/asset-contract.mjs';

const runtimePromise = validateRuntimeAssets();

test('le catalogue v2.5 contient exactement les 103 assets attendus', async () => {
  const runtime = await runtimePromise;
  assert.equal(runtime.manifest.release, ASSET_RELEASE);
  assert.equal(runtime.entries.length, EXPECTED_COUNTS.runtimeFiles);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'arena').length, EXPECTED_COUNTS.arenaLayers);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'boss').length, EXPECTED_COUNTS.bossParts);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'heroine').length, EXPECTED_COUNTS.heroineParts);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'vfx').length, EXPECTED_COUNTS.vfx);
  assert.deepEqual(Object.keys(runtime.manifest.arenas), [...BOSS_IDS]);
  assert.deepEqual(Object.keys(runtime.manifest.bosses), [...BOSS_IDS]);
});

test('dimensions, alpha, signatures, tailles et SHA-256 sont vérifiés', async () => {
  const runtime = await runtimePromise;
  assert.equal(runtime.totalBytes, 13_113_368);
  assert.ok(runtime.totalBytes <= ASSET_BUDGET_BYTES);
  assert.equal(runtime.alphaCount, EXPECTED_COUNTS.alpha);
  assert.equal(runtime.opaqueCount, EXPECTED_COUNTS.opaque);
  assert.equal(runtime.entries.filter(entry => entry.chunk === 'VP8L').length, EXPECTED_COUNTS.alpha);
  assert.equal(runtime.entries.filter(entry => entry.chunk === 'VP8 ').length, EXPECTED_COUNTS.opaque);
  assert.ok(runtime.entries.every(entry => /^[a-f0-9]{64}$/.test(entry.sha256)));
});

test('seul le runtime versionné est déclaré, jamais les masters OpenAI', async () => {
  const runtime = await runtimePromise;
  assert.ok(runtime.files.includes(ASSET_MANIFEST_PATH));
  assert.ok(runtime.entries.every(entry => entry.src.startsWith('assets/generated/v2.5.0/')));
  assert.ok(runtime.entries.every(entry => entry.src.endsWith('.webp')));
  assert.ok(runtime.entries.every(entry => !/assets\/generated\/(?:arenas|bosses|riva|vfx)\//.test(entry.src)));
  const sources = runtime.entries.map(entry => entry.src);
  assert.equal(new Set(sources).size, EXPECTED_COUNTS.runtimeFiles);
});

test('le build copie le catalogue et les assets déclarés sans copie récursive des masters', async () => {
  const build = await readFile('scripts/build.mjs', 'utf8');
  assert.match(build, /validateRuntimeAssets\(root\)/);
  assert.match(build, /\.\.\.runtimeAssets\.files/);
  assert.doesNotMatch(build, /cp\(resolve\(root, 'assets'/);
  assert.doesNotMatch(build, /assets\/generated\/(?:arenas|bosses|riva|vfx)/);
});
