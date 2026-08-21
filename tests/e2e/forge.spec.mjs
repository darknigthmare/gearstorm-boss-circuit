import { test, expect } from '@playwright/test';

async function waitForQa(page) {
  await page.waitForFunction(() => Boolean(window.__GEARSTORM_QA__?.ready), null, { timeout: 20_000 });
}

test('le menu, la Forge et le rig de Riva restent lisibles et cohérents', async ({ page }) => {
  await page.goto('/?qa=1');
  await waitForQa(page);

  await expect(page.locator('#game-title')).toContainText('GEARSTORM');
  await expect(page.locator('#forge')).toBeVisible();
  await page.locator('#forge').click();
  await expect(page.locator('#boss-select-screen')).toHaveClass(/active/);
  await expect(page.locator('#forge-run-summary')).toBeVisible();
  await expect(page.locator('#boss-grid [data-boss-id]')).toHaveCount(30);

  const diagnostics = await page.evaluate(() => window.__GEARSTORM_QA__.getRigDiagnostics());
  expect(diagnostics.heroine.renderedFeetLocalY).toBeCloseTo(diagnostics.heroine.hitbox.groundLocalY, 1);
  expect(diagnostics.heroine.visibleArmSources.body).toContain('body-core');
  expect(diagnostics.heroine.visibleArmSources.firingArm).toContain('firing-arm');

  const overflow = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.width + 1);
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
});

test('le Circuit Forge démarre avec un checkpoint reprenable', async ({ page }) => {
  await page.goto('/?qa=1&mode=forge');
  await waitForQa(page);
  await expect(page.locator('#boss-select-screen')).toHaveClass(/active/);
  await page.locator('#forge-rush-start').click();
  await page.waitForFunction(() => window.__GEARSTORM_QA__.getState().bossId === 'bastion-ricochet');
  await page.evaluate(() => window.__GEARSTORM_QA__.skipIntro());

  const run = await page.evaluate(() => window.__GEARSTORM_QA__.getForgeRunState());
  expect(run.active).toBe(true);
  expect(run.bossId).toBe('bastion-ricochet');
  expect(run.wave).toBe(1);
  expect(run.completed).toBe(0);
});
