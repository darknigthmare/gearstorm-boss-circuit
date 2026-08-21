import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  ASSET_BUDGET_BYTES,
  ASSET_MANIFEST_PATH,
  ASSET_RELEASE,
  BOSS_IDS,
  CORE_BOSS_IDS,
  EXPANSION_BOSS_IDS,
  EXPANSION_PART_NAMES,
  EXPECTED_COUNTS,
  validateRuntimeAssets,
} from '../scripts/asset-contract.mjs';

const runtimePromise = validateRuntimeAssets();

test('le catalogue v2.7 contient exactement les 225 assets attendus', async () => {
  const runtime = await runtimePromise;
  assert.equal(runtime.manifest.release, ASSET_RELEASE);
  assert.equal(runtime.entries.length, EXPECTED_COUNTS.runtimeFiles);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'arena' && entry.name !== 'backdrop').length, EXPECTED_COUNTS.arenaLayers);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'arena' && entry.name === 'backdrop').length, EXPECTED_COUNTS.arenaBackdrops);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'boss').length, EXPECTED_COUNTS.bossParts);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'heroine').length, EXPECTED_COUNTS.heroineParts);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'vfx').length, EXPECTED_COUNTS.vfx);
  assert.deepEqual(Object.keys(runtime.manifest.arenas), [...BOSS_IDS]);
  assert.deepEqual(Object.keys(runtime.manifest.bosses), [...BOSS_IDS]);
  for (const bossId of CORE_BOSS_IDS) assert.equal(runtime.manifest.arenas[bossId].kind, 'parallax');
  for (const bossId of EXPANSION_BOSS_IDS) {
    assert.equal(runtime.manifest.arenas[bossId].kind, 'backdrop');
    assert.deepEqual(Object.keys(runtime.manifest.bosses[bossId].parts), [...EXPANSION_PART_NAMES]);
  }
  assert.ok(runtime.manifest.heroine.parts['body-core']);
  assert.ok(runtime.manifest.heroine.parts['firing-arm']);
});

test('dimensions, alpha, signatures, tailles et SHA-256 sont verifies', async () => {
  const runtime = await runtimePromise;
  assert.equal(runtime.totalBytes, 18_248_604);
  assert.ok(runtime.totalBytes <= ASSET_BUDGET_BYTES);
  assert.equal(runtime.alphaCount, EXPECTED_COUNTS.alpha);
  assert.equal(runtime.opaqueCount, EXPECTED_COUNTS.opaque);
  assert.equal(runtime.entries.filter(entry => entry.chunk === 'VP8L').length, EXPECTED_COUNTS.alpha);
  assert.equal(runtime.entries.filter(entry => entry.chunk === 'VP8 ').length, EXPECTED_COUNTS.opaque);
  assert.ok(runtime.entries.every(entry => /^[a-f0-9]{64}$/.test(entry.sha256)));
});

test('les 24 arenes Forge sont uniques, opaques, 16:9 et calees sur le sol logique', async () => {
  const runtime = await runtimePromise;
  const backdrops = EXPANSION_BOSS_IDS.map(id => runtime.manifest.arenas[id]);
  assert.ok(backdrops.every(arena => arena.groundY === 620 && arena.telegraphSafe === true));
  assert.ok(backdrops.every(arena => arena.backdrop.width === 768 && arena.backdrop.height === 432 && arena.backdrop.alpha === false));
  assert.equal(new Set(backdrops.map(arena => arena.backdrop.sha256)).size, EXPECTED_COUNTS.arenaBackdrops);
  assert.equal(new Set(backdrops.map(arena => arena.backdrop.src)).size, EXPECTED_COUNTS.arenaBackdrops);
  assert.ok(backdrops.every(arena => /^[a-f0-9]{64}$/.test(arena.source.masterSha256)));
});

test('les 24 boss Forge exposent des rigs multipartites complets', async () => {
  const runtime = await runtimePromise;
  for (const bossId of EXPANSION_BOSS_IDS) {
    const boss = runtime.manifest.bosses[bossId];
    assert.deepEqual(Object.keys(boss.parts), [...EXPANSION_PART_NAMES]);
    assert.deepEqual(boss.rig.canvas, { width: 418, height: 418 });
    assert.deepEqual(boss.rig.drawSize, { width: 236, height: 236 });
    assert.equal(boss.rig.weakCore.part, 'core');
    assert.equal(boss.parts.core.role, 'weak-core');
    assert.equal(boss.parts.core.weakCore, true);
    assert.equal(boss.parts['appendage-left'].side, 'left');
    assert.equal(boss.parts['appendage-right'].side, 'right');
    assert.ok(Object.values(boss.rig.coveragePixels).every(value => value >= 64));
    assert.ok(Object.values(boss.parts).every(part => part.alpha && part.width === 418 && part.height === 418));
    assert.ok(Object.values(boss.parts).every(part => part.pivot && part.joint && Number.isInteger(part.z)));
  }
});

test('les 26 masters OpenAI sont traces mais jamais publies', async () => {
  const runtime = await runtimePromise;
  assert.equal(runtime.manifest.sourceMasters.length, EXPECTED_COUNTS.masters);
  assert.equal(runtime.masterFiles.length, EXPECTED_COUNTS.masters);
  assert.equal(runtime.manifest.sourceMasters.filter(master => master.promptId?.startsWith('forge-arenas-')).length, 6);
  assert.ok(runtime.files.includes(ASSET_MANIFEST_PATH));
  assert.ok(runtime.entries.every(entry => entry.src.startsWith('assets/generated/v2.7.0/')));
  assert.ok(runtime.entries.every(entry => entry.src.endsWith('.webp')));
  assert.ok(runtime.masterFiles.every(file => file.endsWith('.png') && !runtime.files.includes(file)));
  assert.ok(runtime.entries.every(entry => !/assets\/generated\/(?:arenas|bosses|riva|vfx|expansion-sources|forge-arena-sources)\//.test(entry.src)));
  assert.equal(new Set(runtime.entries.map(entry => entry.src)).size, EXPECTED_COUNTS.runtimeFiles);
});

test('le build copie le catalogue et les assets declares sans copie recursive des masters', async () => {
  const build = await readFile('scripts/build.mjs', 'utf8');
  assert.match(build, /process\.env\.VERCEL !== '1'/);
  assert.match(build, /validateRuntimeAssets\(root, \{ validateMasters: validateSourceMasters \}\)/);
  assert.match(build, /\.\.\.runtimeAssets\.files/);
  assert.doesNotMatch(build, /cp\(resolve\(root, 'assets'/);
  assert.doesNotMatch(build, /assets\/generated\/(?:arenas|bosses|riva|vfx|expansion-sources|forge-arena-sources)/);
});
