import { test, expect } from '@playwright/test';

async function waitForQa(page) {
  await page.waitForFunction(() => Boolean(window.__GEARSTORM_QA__?.ready), null, { timeout: 20_000 });
}

test('le menu, la Forge et le rig de Riva restent lisibles et cohérents', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?qa=1');
  await waitForQa(page);

  await expect(page.locator('#game-title')).toContainText('GEARSTORM');
  await expect(page.locator('#forge')).toBeVisible();
  await page.locator('#forge').click();
  await expect(page.locator('#boss-select-screen')).toHaveClass(/active/);
  await expect(page.locator('#forge-run-summary')).toBeVisible();
  await expect(page.locator('#boss-grid [data-boss-id]')).toHaveCount(30);

  const diagnostics = await page.evaluate(() => window.__GEARSTORM_QA__.getRigDiagnostics());
  const expectedAnatomy = [
    'boot-far', 'boot-near', 'forearm-cannon-near', 'forearm-far', 'head', 'pelvis',
    'shin-far', 'shin-near', 'thigh-far', 'thigh-near', 'torso', 'upper-arm-far', 'upper-arm-near'
  ];
  expect(diagnostics.heroine.parts).toBe(15);
  expect(diagnostics.heroine.anatomyParts).toBe(13);
  expect(diagnostics.heroine.effectParts).toBe(2);
  expect([...diagnostics.heroine.anatomyPartNames].sort()).toEqual(expectedAnatomy);
  expect(diagnostics.heroine.partNames).not.toContain('body-core');
  expect(diagnostics.heroine.partNames).not.toContain('firing-arm');
  expect(diagnostics.heroine.loadedParts).toBe(15);
  expect(diagnostics.heroine.artReady).toBe(true);
  expect(diagnostics.heroine.feet).toBeCloseTo(36, 5);
  expect(diagnostics.heroine.feetLocalY).toBeCloseTo(36, 5);
  expect(diagnostics.heroine.renderScale).toBeCloseTo(1.10, 5);
  expect(diagnostics.heroine.footOffset).toBeCloseTo(3.6, 5);
  expect(diagnostics.heroine.roadLift).toBe(10);
  expect(diagnostics.heroine.renderedFeetLocalY).toBeCloseTo(
    diagnostics.heroine.feetLocalY * diagnostics.heroine.renderScale
      - diagnostics.heroine.footOffset
      - diagnostics.heroine.roadLift,
    5,
  );
  expect(diagnostics.heroine.hitbox.groundLocalY - diagnostics.heroine.renderedFeetLocalY).toBeCloseTo(10, 5);
  expect(diagnostics.heroine.hierarchical).toBe(true);
  expect(diagnostics.heroine.hierarchy.acyclic).toBe(true);
  expect(diagnostics.heroine.hierarchy.cycles).toEqual([]);
  expect(diagnostics.heroine.hierarchy.missingParents).toEqual([]);
  expect(diagnostics.heroine.hierarchy.roots).toEqual(['pelvis']);
  expect(diagnostics.heroine.hierarchy.reachesPelvis).toBe(true);
  expect(diagnostics.heroine.hierarchy.chains).toEqual([
    ['pelvis', 'torso', 'head'],
    ['pelvis', 'thigh-far', 'shin-far', 'boot-far'],
    ['pelvis', 'thigh-near', 'shin-near', 'boot-near'],
    ['torso', 'upper-arm-far', 'forearm-far'],
    ['torso', 'upper-arm-near', 'forearm-cannon-near'],
  ]);
  expect(diagnostics.heroine.muzzle).toEqual({
    part: 'forearm-cannon-near',
    point: [149, 297],
  });
  expect(Number.isFinite(diagnostics.heroine.renderedMuzzle.x)).toBe(true);
  expect(Number.isFinite(diagnostics.heroine.renderedMuzzle.y)).toBe(true);
  expect(diagnostics.heroine.cannonBaseRotation).toBeCloseTo(-2.1573086184800845, 10);
  expect(diagnostics.heroine.cannonRecoil).toBe(12);
  expect(Math.abs(diagnostics.heroine.renderedCannonAngle)).toBeLessThan(0.001);
  expect(Math.abs(diagnostics.heroine.cannonAimError)).toBeLessThan(0.001);
  const zValues = diagnostics.heroine.zOrder.map(entry => entry.z);
  expect(zValues).toEqual([...zValues].sort((left, right) => left - right));
  expect(diagnostics.activeArenaId).toBe('rammer');
  expect(diagnostics.visualOffsetY).toBe(80);
  expect(diagnostics.heroine.visualOffsetY).toBe(80);
  expect(diagnostics.arenaVisualOffsets.rammer).toBe(80);
  expect(diagnostics.arenaVisualOffsets['bastion-ricochet']).toBe(28);

  const overflow = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.width + 1);

  const cannonPoseAudit = await page.evaluate(() => {
    window.__GEARSTORM_QA__.launchBoss('rammer', { phase: 1 });
    window.__GEARSTORM_QA__.skipIntro();
    const poses = [
      { name: 'idle', pose: { vx: 0, vy: 0, onGround: true, anim: 0, poseAim: 0, poseRecoil: 0, poseLand: 0, dashTime: 0 } },
      { name: 'recoil-only', pose: { vx: 0, vy: 0, onGround: true, anim: 0, poseAim: 0, poseRecoil: 1, poseLand: 0, dashTime: 0 } },
      { name: 'run-forward', pose: { vx: 390, vy: 0, onGround: true, anim: Math.PI / 2, poseAim: 0, poseRecoil: 0, poseLand: 0, dashTime: 0 } },
      { name: 'run-back', pose: { vx: 390, vy: 0, onGround: true, anim: Math.PI * 1.5, poseAim: 0, poseRecoil: 0, poseLand: 0, dashTime: 0 } },
      { name: 'jump-rise', pose: { vx: 180, vy: -720, onGround: false, anim: 0, poseAim: 0, poseRecoil: 0, poseLand: 0, dashTime: 0 } },
      { name: 'jump-fall', pose: { vx: 180, vy: 585, onGround: false, anim: 0, poseAim: 0, poseRecoil: 0, poseLand: 0, dashTime: 0 } },
      { name: 'fire', pose: { vx: 0, vy: 0, onGround: true, anim: 0, poseAim: 1, poseRecoil: 1, poseLand: 0, dashTime: 0 } },
      { name: 'dash', pose: { vx: 940, vy: 0, onGround: true, anim: Math.PI / 2, poseAim: 0, poseRecoil: 0, poseLand: 0, dashTime: 0.19 } },
      { name: 'fire-dash-rise', pose: { vx: 940, vy: -720, onGround: false, anim: 0, poseAim: 1, poseRecoil: 1, poseLand: 0, dashTime: 0.19 } },
    ];
    return poses.map(entry => ({ name: entry.name, rig: window.__GEARSTORM_QA__.setHeroPoseState(entry.pose) }));
  });
  for (const entry of cannonPoseAudit) {
    expect(entry.rig, entry.name).toBeTruthy();
    expect(Math.abs(entry.rig.renderedCannonAngle), entry.name).toBeLessThan(0.001);
    expect(Math.abs(entry.rig.cannonAimError), entry.name).toBeLessThan(0.001);
  }
  const idleRig = cannonPoseAudit.find(entry => entry.name === 'idle').rig;
  const firingRig = cannonPoseAudit.find(entry => entry.name === 'fire').rig;
  const recoilRig = cannonPoseAudit.find(entry => entry.name === 'recoil-only').rig;
  const runRig = cannonPoseAudit.find(entry => entry.name === 'run-forward').rig;
  const jumpRig = cannonPoseAudit.find(entry => entry.name === 'jump-rise').rig;
  expect(firingRig.poseState.aim).toBe(1);
  expect(firingRig.poseState.recoil).toBe(1);
  expect(recoilRig.poseState.recoil).toBe(1);
  expect(idleRig.renderedMuzzle.x - recoilRig.renderedMuzzle.x).toBeCloseTo(13.2, 3);
  expect(Math.abs(recoilRig.renderedMuzzle.y - idleRig.renderedMuzzle.y)).toBeLessThan(0.1);
  expect(Math.hypot(runRig.renderedMuzzle.x - idleRig.renderedMuzzle.x, runRig.renderedMuzzle.y - idleRig.renderedMuzzle.y)).toBeGreaterThan(0.1);
  expect(Math.hypot(jumpRig.renderedMuzzle.x - idleRig.renderedMuzzle.x, jumpRig.renderedMuzzle.y - idleRig.renderedMuzzle.y)).toBeGreaterThan(0.1);

  const forgeOffset = await page.evaluate(() => {
    window.__GEARSTORM_QA__.launchBoss('bastion-ricochet', { phase: 1 });
    return window.__GEARSTORM_QA__.getRigDiagnostics().visualOffsetY;
  });
  expect(forgeOffset).toBe(28);
});

test('les 24 boss Forge ont un système propre et démarrent dans leurs trois phases', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'La matrice 72 lancements tourne une seule fois sur Chromium desktop.');
  await page.goto('/?qa=1');
  await waitForQa(page);

  const roster = await page.evaluate(() => window.__GEARSTORM_QA__.getBossRoster());
  const forge = roster.filter(entry => entry.engine === 'expanded');
  expect(forge).toHaveLength(24);
  expect(new Set(forge.map(entry => entry.mechanicId)).size).toBe(24);
  const coverage = await page.evaluate(() => window.__GEARSTORM_QA__.getForgeContractCoverage());
  expect(coverage.total).toBe(72);
  expect(coverage.supported).toBe(72);
  expect(coverage.unsupported).toEqual([]);

  const launches = await page.evaluate(entries => entries.flatMap(entry => [1, 2, 3].map(phase => {
    const launched = window.__GEARSTORM_QA__.launchBoss(entry.id, { phase });
    const state = window.__GEARSTORM_QA__.getState();
    return { id: entry.id, mechanicId: entry.mechanicId, phase, launched, state };
  })), forge.map(({ id, mechanicId }) => ({ id, mechanicId })));

  expect(launches).toHaveLength(72);
  for (const launch of launches) {
    expect(launch.launched, launch.id + ' phase ' + launch.phase).toBe(true);
    expect(launch.state.bossId).toBe(launch.id);
    expect(launch.state.phase).toBe(launch.phase);
    expect(launch.state.mechanicId).toBe(launch.mechanicId);
  }

  const endurance = await page.evaluate(() => {
    const launched = window.__GEARSTORM_QA__.launchBossPhase('endurance-engine', 2, 4);
    const before = window.__GEARSTORM_QA__.getState();
    const retried = window.__GEARSTORM_QA__.retryCurrentFight();
    const after = window.__GEARSTORM_QA__.getState();
    return { launched, retried, before, after };
  });
  expect(endurance.launched).toBe(true);
  expect(endurance.before.phase).toBe(2);
  expect(endurance.before.enduranceRound).toBe(4);
  expect(endurance.before.signatureCycle).toBe(1);
  expect(endurance.retried).toBe(true);
  expect(endurance.after.phase).toBe(2);
  expect(endurance.after.enduranceRound).toBe(4);
  expect(endurance.after.currentBossRetries).toBe(1);
});

test('le Circuit Forge démarre avec un checkpoint reprenable', async ({ page }) => {
  await page.goto('/?qa=1&mode=forge');
  await waitForQa(page);
  await expect(page.locator('#boss-select-screen')).toHaveClass(/active/);
  await page.locator('#forge-rush-start').click();
  await page.waitForFunction(() => window.__GEARSTORM_QA__.getState().bossId === 'bastion-ricochet');
  await page.evaluate(() => window.__GEARSTORM_QA__.skipIntro());

  expect(await page.evaluate(() => window.__GEARSTORM_QA__.retryCurrentFight())).toBe(true);
  const run = await page.evaluate(() => window.__GEARSTORM_QA__.getForgeRunState());
  expect(run.active).toBe(true);
  expect(run.bossId).toBe('bastion-ricochet');
  expect(run.wave).toBe(1);
  expect(run.completed).toBe(0);
  expect(run.snapshot.currentBossRetries).toBe(1);

  await page.reload();
  await waitForQa(page);
  expect(await page.evaluate(() => window.__GEARSTORM_QA__.resumeForgeRush())).toBe(true);
  const restored = await page.evaluate(() => ({
    state: window.__GEARSTORM_QA__.getState(),
    run: window.__GEARSTORM_QA__.getForgeRunState()
  }));
  expect(restored.state.currentBossRetries).toBe(1);
  expect(restored.run.snapshot.currentBossRetries).toBe(1);
});
