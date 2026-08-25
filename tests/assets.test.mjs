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
  RIVA_HEAD_DROP_Y,
  RIVA_KINEMATIC_CHAINS,
  RIVA_PARENT_BY_PART,
  RIVA_PART_NAMES,
  RIVA_RENDER_ORDER,
  RIVA_ROAD_LIFT,
  validateRuntimeAssets,
} from '../scripts/asset-contract.mjs';

const runtimePromise = validateRuntimeAssets();

test('le catalogue v2.11 contient exactement les 378 assets attendus', async () => {
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
    assert.equal(runtime.manifest.arenas[bossId].kind, 'parallax');
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

test('les 24 arenes Forge ont quatre profondeurs uniques et restent calees sur le sol logique', async () => {
  const runtime = await runtimePromise;
  const arenas = EXPANSION_BOSS_IDS.map(id => runtime.manifest.arenas[id]);
  assert.ok(arenas.every(arena => arena.groundY === 620 && arena.visualOffsetY === 28 && arena.telegraphSafe === true));
  assert.ok(arenas.every(arena => Object.keys(arena.layers).join(',') === 'far,mid,ground,foreground'));
  assert.ok(arenas.every(arena => Object.values(arena.layers).every(layer => layer.width === 768 && layer.height === 432)));
  assert.ok(arenas.every(arena => arena.layers.far.alpha === false
    && ['mid', 'ground', 'foreground'].every(layer => arena.layers[layer].alpha === true)));
  assert.ok(arenas.every(arena => ['far', 'mid', 'ground', 'foreground']
    .map(layer => arena.layers[layer].speed)
    .every((speed, index, speeds) => speed > 0 && (index === 0 || speed > speeds[index - 1]))));
  assert.equal(new Set(arenas.flatMap(arena => Object.values(arena.layers).map(layer => layer.src))).size, 96);
  assert.ok(arenas.every(arena => /^[a-f0-9]{64}$/.test(arena.source.masterSha256)));
});

test('les 24 boss Forge exposent des rigs multipartites complets', async () => {
  const runtime = await runtimePromise;
  for (const bossId of EXPANSION_BOSS_IDS) {
    const boss = runtime.manifest.bosses[bossId];
    assert.deepEqual(Object.keys(boss.parts), [...EXPANSION_PART_NAMES]);
    assert.equal(boss.rig.schemaVersion, 2);
    assert.deepEqual(boss.rig.canvas, { width: 418, height: 418 });
    assert.deepEqual(boss.rig.drawSize, { width: 236, height: 236 });
    assert.match(boss.rig.motionProfile.id, /^forge-signature-\d{2}$/);
    assert.equal(boss.rig.weakCore.part, 'core');
    assert.equal(boss.parts.core.role, 'weak-core');
    assert.equal(boss.parts.core.weakCore, true);
    assert.equal(boss.parts['appendage-left-root'].side, 'left');
    assert.equal(boss.parts['appendage-left-tip'].parent, 'appendage-left-root');
    assert.equal(boss.parts['appendage-right-root'].side, 'right');
    assert.equal(boss.parts['appendage-right-tip'].parent, 'appendage-right-root');
    assert.equal(boss.parts['armor-shell'].parent, 'chassis');
    assert.ok(Object.values(boss.rig.coveragePixels).every(value => value >= 32));
    assert.ok(Object.values(boss.parts).every(part => part.alpha && part.width === 418 && part.height === 418));
    assert.ok(Object.values(boss.parts).every(part => part.pivot && part.joint && Number.isInteger(part.z) && part.motion));
    assert.equal(new Set(Object.values(boss.parts).map(part => part.z)).size, EXPANSION_PART_NAMES.length);
    assert.ok(Object.values(boss.parts).every(part => part.logicalSlot === null
      || (Number.isInteger(part.logicalSlot) && part.logicalSlot >= 0 && part.logicalSlot <= 3)));
  }
});

test('Riva utilise 14 segments anatomiques relies avec avant-bras et canon independants', async () => {
  const runtime = await runtimePromise;
  const heroine = runtime.manifest.heroine;
  assert.deepEqual(Object.keys(heroine.parts), [...RIVA_PART_NAMES]);
  assert.deepEqual(heroine.rig.canvas, { width: 418, height: 418 });
  assert.equal(heroine.rig.coordinateSpace, 'player-local-pixels');
  assert.equal(heroine.rig.feetLocalY, 36);
  assert.deepEqual(heroine.rig.ground, { physicalY: 620, localY: 36 });
  assert.deepEqual(heroine.rig.muzzle, {
    part: 'cannon-near',
    point: [149, 297],
  });
  assert.ok(heroine.rig.rootOffsetY < 0);
  assert.equal(RIVA_HEAD_DROP_Y, 4);
  assert.equal(heroine.rig.headDropY, RIVA_HEAD_DROP_Y);
  const measuredFeet = Math.max(...heroine.rig.parts
    .filter(part => RIVA_ANATOMY_PART_NAMES.includes(part.name))
    .map(part => part.joint[1] + (part.bbox[1] + part.bbox[3] - part.pivot[1]) * part.scale));
  assert.ok(Math.abs(measuredFeet - 36) <= 0.05);
  assert.deepEqual(heroine.rig.parts.map(part => part.name), [...RIVA_RENDER_ORDER]);
  assert.ok(heroine.rig.parts.every((part, index, parts) => index === 0 || part.z > parts[index - 1].z));
  assert.ok(heroine.rig.parts.every(part => part.joint.length === 2 && part.pivot.length === 2 && part.bbox.length === 4));
  assert.ok(heroine.rig.parts.every(part => part.bbox[2] > 0 && part.bbox[3] > 0 && part.coveragePixels >= 64));

  const specs = new Map(heroine.rig.parts.map(part => [part.name, part]));
  assert.equal(specs.get('head').joint[1] - heroine.rig.rootOffsetY, -70 + RIVA_HEAD_DROP_Y);
  assert.equal(specs.get('head').joint[1] - specs.get('torso').joint[1], -48);
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
    ['upper-arm-far', 'forearm-far'], ['upper-arm-near', 'forearm-near'],
  ]) {
    const parent = specs.get(parentName);
    const child = specs.get(childName);
    const distance = Math.hypot(child.joint[0] - parent.joint[0], child.joint[1] - parent.joint[1]);
    assert.ok(distance >= 24 && distance <= 52, parentName + ' > ' + childName + ': ' + distance);
  }

  const anatomy = RIVA_ANATOMY_PART_NAMES.map(name => heroine.parts[name]);
  assert.ok(anatomy.every(part => part.role === 'anatomy' && part.nativePart === true));
  assert.ok(anatomy.every(part => part.alpha && part.width === 418 && part.height === 418));
  assert.equal(new Set(anatomy.map(part => part.source.masterFile)).size, 13);
  for (const name of RIVA_ANATOMY_PART_NAMES) {
    const masterName = ['forearm-near', 'cannon-near'].includes(name) ? 'forearm-cannon-near' : name;
    assert.equal(heroine.parts[name].source.masterFile, `assets/generated/riva-v2.9-sources/${masterName}-openai-v1.png`);
  }
  const forearm = specs.get('forearm-near');
  const cannon = specs.get('cannon-near');
  assert.equal(cannon.parent, 'forearm-near');
  assert.deepEqual(cannon.joint, forearm.joint);
  assert.deepEqual(cannon.pivot, forearm.pivot);
  assert.equal(cannon.scale, forearm.scale);
  assert.equal(forearm.motion, 'cannon-mount');
  assert.equal(cannon.motion, 'cannon-recoil');
  assert.equal(heroine.rig.nearArmSplit.source.masterFile,
    'assets/generated/riva-v2.9-sources/forearm-cannon-near-openai-v1.png');
  assert.equal(heroine.rig.nearArmSplit.separationReference.masterFile,
    'assets/generated/riva-v2.11-sources/forearm-cannon-split-openai-v1.png');
  assert.deepEqual(heroine.rig.nearArmSplit.unionBBox, [130, 104, 158, 210]);
  assert.equal(heroine.rig.nearArmSplit.combinedCoveragePixels, 13340);
  assert.equal(
    forearm.coveragePixels
      + cannon.coveragePixels,
    heroine.rig.nearArmSplit.combinedCoveragePixels,
  );
  assert.match(heroine.rig.nearArmSplit.neutralCompositeSha256, /^[a-f0-9]{64}$/);
  assert.ok(heroine.rig.nearArmSplit.splitProgress > 0
    && heroine.rig.nearArmSplit.splitProgress < 1);
  for (const forbidden of ['arm-near', 'arm-far', 'legs', 'boots', 'pulse-cannon', 'body-core', 'firing-arm', 'forearm-cannon-near']) {
    assert.equal(heroine.parts[forbidden], undefined);
  }
  assert.deepEqual(RIVA_EFFECT_PART_NAMES.map(name => heroine.parts[name].source.atlasCell), [7, 8]);
  assert.equal(heroine.rig.canonicalReference.masterFile, 'assets/generated/riva-v2.9-sources/riva-canonical-openai-v1.png');
});

test('le runtime applique la hierarchie, le muzzle articule et la montee route de 10 px', async () => {
  const game = await readFile('game.js', 'utf8');
  const generator = await readFile('scripts/process-openai-art.py', 'utf8');
  assert.equal(RIVA_ROAD_LIFT, 10);
  assert.match(game, /const RIVA_ROAD_LIFT = 10;/);
  assert.match(game, /const RIVA_CANNON_RECOIL = 12;/);
  assert.match(game, /function resolveHeroRigPose\(/);
  assert.match(game, /const parentPose = parentSpec \? resolve\(parentSpec\) : null;/);
  assert.match(game, /rotation \+= parentPose\.rotation;/);
  assert.match(game, /function renderedHeroMuzzle\(/);
  assert.match(game, /const snapshot = resolveHeroRigPose\(rigParts\);/);
  assert.match(game, /pose\.joint\[0\] \+ endpoint\.x/);
  assert.match(game, /RIVA_FOOT_OFFSET - RIVA_ROAD_LIFT/);
  assert.match(game, /rotateRigVector\(-animation\.recoil \* RIVA_CANNON_RECOIL, 0, -rootRotation\)/);
  assert.match(game, /spawnDust\(player\.x, GROUND - \(heroArtReady\(\) \? RIVA_ROAD_LIFT : 0\), 7\);/);
  assert.match(generator, /RIVA_HEAD_DROP_Y = 4/);
  assert.match(generator, /contract\["joint"\]\[1\] \+ \(RIVA_HEAD_DROP_Y if part == "head" else 0\)/);
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
    assert.equal(runtime.manifest.narrative[name].src, `assets/generated/v${ASSET_RELEASE}/narrative/${name}.webp`);
    assert.equal(runtime.manifest.narrative[name].source.masterFile, `assets/generated/narrative-v2.9-sources/${name}-openai-v1.png`);
  }
});

test('les 43 masters OpenAI sont traces mais jamais publies', async () => {
  const runtime = await runtimePromise;
  assert.equal(runtime.manifest.sourceMasters.length, EXPECTED_COUNTS.masters);
  assert.equal(runtime.masterFiles.length, EXPECTED_COUNTS.masters);
  assert.equal(runtime.manifest.sourceMasters.filter(master => master.promptId?.startsWith('forge-arenas-')).length, 6);
  assert.equal(runtime.manifest.sourceMasters.filter(master => master.promptId?.startsWith('riva-') && master.promptId.includes('v2.9')).length, 14);
  assert.equal(runtime.manifest.sourceMasters.filter(master => master.promptId?.startsWith('narrative-')).length, 4);
  assert.ok(runtime.files.includes(ASSET_MANIFEST_PATH));
  assert.ok(runtime.entries.every(entry => entry.src.startsWith(`assets/generated/v${ASSET_RELEASE}/`)));
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
