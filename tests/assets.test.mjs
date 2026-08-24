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
  NARRATIVE_NAMES,
  RIVA_ANATOMY_PART_NAMES,
  RIVA_EFFECT_PART_NAMES,
  RIVA_KINEMATIC_CHAINS,
  RIVA_PARENT_BY_PART,
  RIVA_PART_NAMES,
  RIVA_RENDER_ORDER,
  RIVA_ROAD_LIFT,
  validateRuntimeAssets,
} from '../scripts/asset-contract.mjs';

const runtimePromise = validateRuntimeAssets();

test('le catalogue v2.9 contient exactement les 233 assets attendus', async () => {
  const runtime = await runtimePromise;
  assert.equal(runtime.manifest.release, ASSET_RELEASE);
  assert.equal(runtime.entries.length, EXPECTED_COUNTS.runtimeFiles);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'arena' && entry.name !== 'backdrop').length, EXPECTED_COUNTS.arenaLayers);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'arena' && entry.name === 'backdrop').length, EXPECTED_COUNTS.arenaBackdrops);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'boss').length, EXPECTED_COUNTS.bossParts);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'heroine').length, EXPECTED_COUNTS.heroineParts);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'vfx').length, EXPECTED_COUNTS.vfx);
  assert.equal(runtime.entries.filter(entry => entry.kind === 'narrative').length, EXPECTED_COUNTS.narrative);
  assert.deepEqual(Object.keys(runtime.manifest.arenas), [...BOSS_IDS]);
  assert.deepEqual(Object.keys(runtime.manifest.bosses), [...BOSS_IDS]);
  for (const bossId of CORE_BOSS_IDS) {
    assert.equal(runtime.manifest.arenas[bossId].kind, 'parallax');
    assert.equal(runtime.manifest.arenas[bossId].visualOffsetY, 80);
  }
  for (const bossId of EXPANSION_BOSS_IDS) {
    assert.equal(runtime.manifest.arenas[bossId].kind, 'backdrop');
    assert.deepEqual(Object.keys(runtime.manifest.bosses[bossId].parts), [...EXPANSION_PART_NAMES]);
  }
  assert.deepEqual(Object.keys(runtime.manifest.heroine.parts), [...RIVA_PART_NAMES]);
  assert.deepEqual(runtime.manifest.heroine.rig.parts.map(part => part.name), [...RIVA_RENDER_ORDER]);
  assert.deepEqual(Object.keys(runtime.manifest.narrative), [...NARRATIVE_NAMES]);
});

test('dimensions, alpha, signatures, tailles et SHA-256 sont verifies', async () => {
  const runtime = await runtimePromise;
  assert.equal(runtime.totalBytes, runtime.manifest.summary.totalBytes);
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
  assert.ok(backdrops.every(arena => arena.groundY === 620 && arena.visualOffsetY === 28 && arena.telegraphSafe === true));
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

test('Riva utilise 13 masters natifs relies par un rig hierarchique sans fusion de segments', async () => {
  const runtime = await runtimePromise;
  const heroine = runtime.manifest.heroine;
  assert.deepEqual(Object.keys(heroine.parts), [...RIVA_PART_NAMES]);
  assert.deepEqual(heroine.rig.canvas, { width: 418, height: 418 });
  assert.equal(heroine.rig.coordinateSpace, 'player-local-pixels');
  assert.equal(heroine.rig.feetLocalY, 36);
  assert.deepEqual(heroine.rig.ground, { physicalY: 620, localY: 36 });
  assert.deepEqual(heroine.rig.muzzle, {
    part: 'forearm-cannon-near',
    point: [156, 297],
  });
  assert.ok(heroine.rig.rootOffsetY < 0);
  const measuredFeet = Math.max(...heroine.rig.parts
    .filter(part => RIVA_ANATOMY_PART_NAMES.includes(part.name))
    .map(part => part.joint[1] + (part.bbox[1] + part.bbox[3] - part.pivot[1]) * part.scale));
  assert.ok(Math.abs(measuredFeet - 36) <= 0.05);
  assert.deepEqual(heroine.rig.parts.map(part => part.name), [...RIVA_RENDER_ORDER]);
  assert.ok(heroine.rig.parts.every((part, index, parts) => index === 0 || part.z > parts[index - 1].z));
  assert.ok(heroine.rig.parts.every(part => part.joint.length === 2 && part.pivot.length === 2 && part.bbox.length === 4));
  assert.ok(heroine.rig.parts.every(part => part.bbox[2] > 0 && part.bbox[3] > 0 && part.coveragePixels >= 64));

  const specs = new Map(heroine.rig.parts.map(part => [part.name, part]));
  const anatomyRoots = RIVA_ANATOMY_PART_NAMES.filter(name => specs.get(name).parent === null);
  assert.deepEqual(anatomyRoots, ['pelvis']);
  assert.deepEqual(
    Object.fromEntries(RIVA_ANATOMY_PART_NAMES.map(name => [name, specs.get(name).parent])),
    { ...RIVA_PARENT_BY_PART },
  );
  assert.ok(RIVA_EFFECT_PART_NAMES.every(name => specs.get(name).parent === null));
  for (const chain of RIVA_KINEMATIC_CHAINS) {
    for (let index = 1; index < chain.length; index += 1) {
      assert.equal(specs.get(chain[index]).parent, chain[index - 1], chain.join(' > '));
    }
  }
  for (const name of RIVA_ANATOMY_PART_NAMES) {
    const visited = new Set();
    let current = specs.get(name);
    while (current.parent !== null) {
      assert.equal(visited.has(current.name), false, 'cycle via ' + current.name);
      visited.add(current.name);
      current = specs.get(current.parent);
      assert.ok(current, 'parent manquant depuis ' + name);
    }
    assert.equal(current.name, 'pelvis', name + ' doit atteindre pelvis');
  }
  for (const [parentName, childName] of [
    ['thigh-far', 'shin-far'], ['shin-far', 'boot-far'],
    ['thigh-near', 'shin-near'], ['shin-near', 'boot-near'],
    ['upper-arm-far', 'forearm-far'], ['upper-arm-near', 'forearm-cannon-near'],
  ]) {
    const parent = specs.get(parentName);
    const child = specs.get(childName);
    const distance = Math.hypot(child.joint[0] - parent.joint[0], child.joint[1] - parent.joint[1]);
    assert.ok(distance >= 24 && distance <= 52, parentName + ' > ' + childName + ': ' + distance);
  }

  const anatomy = RIVA_ANATOMY_PART_NAMES.map(name => heroine.parts[name]);
  assert.ok(anatomy.every(part => part.role === 'anatomy' && part.nativePart === true));
  assert.ok(anatomy.every(part => part.alpha && part.width === 418 && part.height === 418));
  assert.equal(new Set(anatomy.map(part => part.source.masterFile)).size, RIVA_ANATOMY_PART_NAMES.length);
  for (const name of RIVA_ANATOMY_PART_NAMES) {
    assert.equal(heroine.parts[name].source.masterFile, `assets/generated/riva-v2.9-sources/${name}-openai-v1.png`);
  }
  for (const forbidden of ['arm-near', 'arm-far', 'legs', 'boots', 'pulse-cannon', 'body-core', 'firing-arm']) {
    assert.equal(heroine.parts[forbidden], undefined);
  }
  assert.deepEqual(RIVA_EFFECT_PART_NAMES.map(name => heroine.parts[name].source.atlasCell), [7, 8]);
  assert.equal(heroine.rig.canonicalReference.masterFile, 'assets/generated/riva-v2.9-sources/riva-canonical-openai-v1.png');
});

test('le runtime applique la hierarchie, le muzzle articule et la montee route de 10 px', async () => {
  const game = await readFile('game.js', 'utf8');
  assert.equal(RIVA_ROAD_LIFT, 10);
  assert.match(game, /const RIVA_ROAD_LIFT = 10;/);
  assert.match(game, /function resolveHeroRigPose\(/);
  assert.match(game, /const parentPose = parentSpec \? resolve\(parentSpec\) : null;/);
  assert.match(game, /rotation \+= parentPose\.rotation;/);
  assert.match(game, /function renderedHeroMuzzle\(/);
  assert.match(game, /const snapshot = resolveHeroRigPose\(rigParts\);/);
  assert.match(game, /pose\.joint\[0\] \+ endpoint\.x/);
  assert.match(game, /RIVA_FOOT_OFFSET - RIVA_ROAD_LIFT/);
});

test('les 4 visuels narratifs OpenAI sont opaques, 16:9 et traces', async () => {
  const runtime = await runtimePromise;
  assert.deepEqual(Object.keys(runtime.manifest.narrative), [...NARRATIVE_NAMES]);
  const narrative = Object.values(runtime.manifest.narrative);
  assert.ok(narrative.every(asset => asset.width === 1280 && asset.height === 720 && asset.alpha === false));
  assert.ok(narrative.every(asset => asset.focalPoint && asset.safeTextZone));
  assert.equal(new Set(narrative.map(asset => asset.src)).size, EXPECTED_COUNTS.narrative);
  assert.equal(new Set(narrative.map(asset => asset.source.masterFile)).size, EXPECTED_COUNTS.narrative);
  for (const name of NARRATIVE_NAMES) {
    assert.equal(runtime.manifest.narrative[name].src, `assets/generated/v2.9.1/narrative/${name}.webp`);
    assert.equal(runtime.manifest.narrative[name].source.masterFile, `assets/generated/narrative-v2.9-sources/${name}-openai-v1.png`);
  }
});

test('les 42 masters OpenAI sont traces mais jamais publies', async () => {
  const runtime = await runtimePromise;
  assert.equal(runtime.manifest.sourceMasters.length, EXPECTED_COUNTS.masters);
  assert.equal(runtime.masterFiles.length, EXPECTED_COUNTS.masters);
  assert.equal(runtime.manifest.sourceMasters.filter(master => master.promptId?.startsWith('forge-arenas-')).length, 6);
  assert.equal(runtime.manifest.sourceMasters.filter(master => master.promptId?.startsWith('riva-') && master.promptId.includes('v2.9')).length, 14);
  assert.equal(runtime.manifest.sourceMasters.filter(master => master.promptId?.startsWith('narrative-')).length, 4);
  assert.ok(runtime.files.includes(ASSET_MANIFEST_PATH));
  assert.ok(runtime.entries.every(entry => entry.src.startsWith('assets/generated/v2.9.1/')));
  assert.ok(runtime.entries.every(entry => entry.src.endsWith('.webp')));
  assert.ok(runtime.masterFiles.every(file => file.endsWith('.png') && !runtime.files.includes(file)));
  assert.ok(runtime.entries.every(entry => !/assets\/generated\/(?:arenas|bosses|riva|vfx|expansion-sources|forge-arena-sources|riva-v2\.9-sources|narrative-v2\.9-sources)\//.test(entry.src)));
  assert.equal(new Set(runtime.entries.map(entry => entry.src)).size, EXPECTED_COUNTS.runtimeFiles);
});

test('le build copie le catalogue et les assets declares sans copie recursive des masters', async () => {
  const build = await readFile('scripts/build.mjs', 'utf8');
  assert.match(build, /process\.env\.VERCEL !== '1'/);
  assert.match(build, /validateRuntimeAssets\(root, \{ validateMasters: validateSourceMasters \}\)/);
  assert.match(build, /\.\.\.runtimeAssets\.files/);
  assert.doesNotMatch(build, /cp\(resolve\(root, 'assets'/);
  assert.doesNotMatch(build, /assets\/generated\/(?:arenas|bosses|riva|vfx|expansion-sources|forge-arena-sources|riva-v2\.9-sources|narrative-v2\.9-sources)/);
});
