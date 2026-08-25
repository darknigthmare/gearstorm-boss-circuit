import { test, expect } from '@playwright/test';

const CURRENT_SAVE_KEY = 'gearstorm_boss_circuit_save_v6';
const PREVIOUS_SAVE_KEY = 'gearstorm_boss_circuit_save_v5';

async function waitForQa(page) {
  await page.waitForFunction(() => Boolean(window.__GEARSTORM_QA__?.ready), null, { timeout: 20_000 });
}

async function pulseGamepadButton(page, index) {
  await page.evaluate(buttonIndex => {
    window.__GEARSTORM_E2E_PAD__.setButton(buttonIndex, true);
    window.__GEARSTORM_QA__.processGamepad();
  }, index);
  await page.waitForTimeout(20);
  await page.evaluate(buttonIndex => {
    window.__GEARSTORM_E2E_PAD__.setButton(buttonIndex, false);
    window.__GEARSTORM_QA__.processGamepad();
  }, index);
  await page.waitForTimeout(20);
}

async function importSave(page, payload, name = 'gearstorm-e2e-save.json') {
  await page.locator('#import-save-file').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(payload))
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => window.__GEARSTORM_E2E_PAD__?.getPads?.() || []
    });
  });
});

test('options, sauvegarde portable et focus clavier restent accessibles', async ({ page }) => {
  await page.goto('/?qa=1');
  await waitForQa(page);

  await page.locator('#settings').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#settings-screen')).toHaveClass(/active/);
  await expect(page.locator('#settings-screen .back-button')).toBeFocused();

  const exportButton = page.locator('#export-save');
  const importButton = page.locator('#import-save');
  await expect(exportButton).toBeVisible();
  await expect(importButton).toBeVisible();
  for (const control of [exportButton, importButton, page.locator('#reset-save')]) {
    const box = await control.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  await exportButton.focus();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('import-save');

  const downloadPromise = page.waitForEvent('download');
  await exportButton.click();
  const download = await downloadPromise;
  await expect(page.locator('#toast')).toContainText('JSON version 6');
  expect(download.suggestedFilename()).toMatch(/^gearstorm-save-v6-\d{4}-\d{2}-\d{2}\.json$/);

  await page.locator('#import-save-file').setInputFiles({
    name: 'gearstorm-e2e-save.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      version: 5,
      unlocked: 2,
      campaignCleared: ['rammer'],
      codexUnlocked: ['rammer'],
      settings: {
        difficulty: 'casual',
        audio: false,
        shake: false,
        reduceMotion: true,
        highContrast: true,
        combatHints: false
      }
    }))
  });
  await expect(page.locator('#difficulty-select')).toHaveValue('casual');
  await expect(page.locator('body')).toHaveClass(/reduce-motion/);
  await expect(page.locator('body')).toHaveClass(/high-contrast/);
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)).settings.difficulty, CURRENT_SAVE_KEY)).toBe('casual');

  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Quota test', 'QuotaExceededError'); };
  });
  await page.locator('#import-save-file').setInputFiles({
    name: 'gearstorm-e2e-unpersistable.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 5, settings: { difficulty: 'overdrive' } }))
  });
  await expect(page.locator('#difficulty-select')).toHaveValue('casual');
  await expect(page.locator('#toast')).toContainText('IMPORT ANNULÉ');
  await expect(page.locator('#game-status')).toContainText('stockage local indisponible');
});

test('les preferences systeme initialisent seulement une nouvelle sauvegarde', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value(query) {
        if (query !== '(prefers-contrast: more)') return nativeMatchMedia(query);
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent() { return true; }
        };
      }
    });
  });
  await page.goto('/?qa=1');
  await waitForQa(page);

  await expect(page.locator('body')).toHaveClass(/reduce-motion/);
  await expect(page.locator('body')).toHaveClass(/high-contrast/);
  await page.locator('#settings').click();
  await expect(page.locator('#motion-toggle')).toBeChecked();
  await expect(page.locator('#contrast-toggle')).toBeChecked();
});

test('la navigation Gamepad simulee pilote le menu sans clavier', async ({ page }) => {
  await page.addInitScript(() => {
    const pad = {
      connected: true,
      id: 'GEARSTORM E2E STANDARD PAD',
      index: 1,
      mapping: 'standard',
      timestamp: 0,
      axes: [0, 0, 0, 0],
      buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }))
    };
    window.__GEARSTORM_E2E_PAD__ = {
      getPads() {
        return [null, pad];
      },
      setButton(index, pressed) {
        pad.buttons[index] = { pressed, touched: pressed, value: pressed ? 1 : 0 };
        pad.timestamp += 1;
      }
    };
  });

  await page.goto('/?qa=1');
  await waitForQa(page);
  await pulseGamepadButton(page, 13);
  await expect(page.locator('#practice')).toBeFocused();
  await pulseGamepadButton(page, 0);
  await expect(page.locator('#boss-select-screen')).toHaveClass(/active/);

  await pulseGamepadButton(page, 1);
  await expect(page.locator('#title-screen')).toHaveClass(/active/);
  await page.locator('#settings').click();
  await expect(page.locator('#settings-screen')).toHaveClass(/active/);

  await page.locator('#import-save').focus();
  await pulseGamepadButton(page, 13);
  await expect(page.locator('#reset-save')).toBeFocused();

  const volume = page.locator('#master-volume');
  const before = Number(await volume.inputValue());
  await page.evaluate(() => {
    document.querySelector('#master-volume').focus();
    window.__GEARSTORM_E2E_PAD__.setButton(15, true);
    window.__GEARSTORM_QA__.processGamepad();
    window.__GEARSTORM_E2E_PAD__.setButton(15, false);
    window.__GEARSTORM_QA__.processGamepad();
  });
  expect(Number(await volume.inputValue())).toBeGreaterThan(before);
});

test('le shell deja installe recharge hors ligne', async ({ page, context, browserName }) => {
  test.skip(browserName === 'webkit', 'Le runner Playwright WebKit Windows echoue avant la resolution du service worker hors ligne.');
  await page.goto('/?qa=1');
  await waitForQa(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#game-title')).toContainText('GEARSTORM');
    await expect(page.locator('#start-rush')).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
test('Espace active un bouton hors combat', async ({ page }) => {
  await page.goto('/?qa=1');
  await waitForQa(page);

  const settingsButton = page.locator('#settings');
  await settingsButton.focus();
  await page.keyboard.press('Space');

  await expect(page.locator('#settings-screen')).toHaveClass(/active/);
});

test('les fleches ajustent le volume quand le range a le focus', async ({ page }) => {
  await page.goto('/?qa=1');
  await waitForQa(page);
  await page.locator('#settings').click();

  const volume = page.locator('#master-volume');
  await volume.focus();
  const before = Number(await volume.inputValue());
  await page.keyboard.press('ArrowLeft');

  expect(Number(await volume.inputValue())).toBeLessThan(before);
  await expect(page.locator('#master-volume-value')).toHaveText((before - 5) + ' %');
});

test('le retour des Options et du Codex restaure le focus a leur ouvreur', async ({ page }) => {
  await page.goto('/?qa=1');
  await waitForQa(page);

  const routes = [
    { opener: '#settings', screen: '#settings-screen' },
    { opener: '#codex', screen: '#codex-screen' }
  ];
  for (const route of routes) {
    const opener = page.locator(route.opener);
    await opener.click();
    const screen = page.locator(route.screen);
    await expect(screen).toHaveClass(/active/);
    await screen.locator('.back-button').click();
    await expect(page.locator('#title-screen')).toHaveClass(/active/);
    await expect.soft(opener, 'focus restaure vers ' + route.opener).toBeFocused();
  }
});

test('une campagne terminee normalise le dernier boss comme debloque', async ({ page }) => {
  await page.goto('/?qa=1');
  await waitForQa(page);

  await importSave(page, {
    version: 5,
    completed: true,
    unlocked: 1,
    settings: { difficulty: 'standard' }
  }, 'gearstorm-e2e-completed.json');

  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)).unlocked, CURRENT_SAVE_KEY)).toBe(6);
});

test('une sauvegarde v6 corrompue recupere la sauvegarde v5 valide', async ({ page }) => {
  await page.addInitScript(({ currentKey, previousKey }) => {
    localStorage.setItem(currentKey, '{"version":6,"unlocked":');
    localStorage.setItem(previousKey, JSON.stringify({
      version: 5,
      unlocked: 3,
      campaignCleared: ['rammer', 'kraken'],
      settings: {
        difficulty: 'overdrive',
        audio: false,
        volume: 0.45,
        shake: false,
        reduceMotion: false,
        highContrast: false,
        combatHints: true
      }
    }));
  }, { currentKey: CURRENT_SAVE_KEY, previousKey: PREVIOUS_SAVE_KEY });

  await page.goto('/?qa=1');
  await waitForQa(page);

  await expect(page.locator('#difficulty-select')).toHaveValue('overdrive');
  await expect.poll(() => page.evaluate(key => {
    try {
      const restored = JSON.parse(localStorage.getItem(key));
      return { unlocked: restored.unlocked, difficulty: restored.settings?.difficulty };
    } catch {
      return null;
    }
  }, CURRENT_SAVE_KEY)).toEqual({ unlocked: 3, difficulty: 'overdrive' });
});

test('les checkpoints finaux incoherents sont normalises', async ({ page }) => {
  await page.goto('/?qa=1');
  await waitForQa(page);

  await importSave(page, {
    version: 5,
    rushSnapshot: {
      bossIndex: 5,
      checkpoint: 'upgrade',
      pendingUpgrade: true,
      upgradeOffer: []
    },
    forgeRushSnapshot: {
      bossIndex: 6,
      checkpoint: 'ending',
      completedBosses: 24
    }
  }, 'gearstorm-e2e-invalid-final-checkpoints.json');

  const premature = await page.evaluate(key => {
    const stored = JSON.parse(localStorage.getItem(key));
    return {
      rush: stored.rushSnapshot,
      forge: stored.forgeRushSnapshot
    };
  }, CURRENT_SAVE_KEY);
  expect(premature.rush.checkpoint).toBe('interlude');
  expect(premature.rush.pendingUpgrade).toBe(false);
  expect(premature.rush.upgradeOffer).toEqual([]);
  expect(premature.forge.checkpoint).toBe('fight');
  expect(premature.forge.completedBosses).toBe(0);

  await importSave(page, {
    version: 5,
    forgeRushSnapshot: {
      bossIndex: 29,
      checkpoint: 'upgrade',
      completedBosses: 24,
      upgradeOffer: []
    }
  }, 'gearstorm-e2e-final-forge-checkpoint.json');

  await expect.poll(() => page.evaluate(key => {
    const snapshot = JSON.parse(localStorage.getItem(key)).forgeRushSnapshot;
    return { checkpoint: snapshot.checkpoint, completedBosses: snapshot.completedBosses };
  }, CURRENT_SAVE_KEY)).toEqual({ checkpoint: 'ending', completedBosses: 24 });
});

test('les commandes tactiles pilotent mouvement saut tir ruee et pause', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-mobile', 'Le contrat tactile cible le vrai profil Pixel 7.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?qa=1');
  await waitForQa(page);
  const protectedRenderAlpha = await page.evaluate(() => {
    window.__GEARSTORM_QA__.launchBoss('rammer', { mode: 'practice' });
    window.__GEARSTORM_QA__.skipIntro();
    window.__GEARSTORM_QA__.protectPlayer();
    return window.__GEARSTORM_QA__.getRigDiagnostics().heroine.renderAlpha;
  });
  expect(protectedRenderAlpha).toBeCloseTo(0.46, 5);
  await page.waitForFunction(() => window.__GEARSTORM_QA__.getState().state === 'fight');
  await expect(page.locator('#touch-controls')).toBeVisible();

  const pointerDown = { pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0, buttons: 1 };
  const pointerUp = { pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0, buttons: 0 };

  const right = page.locator('[data-touch="right"]');
  await right.dispatchEvent('pointerdown', pointerDown);
  await page.waitForFunction(() => window.__GEARSTORM_QA__.getRigDiagnostics().heroine.poseState?.speedPose > 0.05);
  const movingPose = await page.evaluate(() => window.__GEARSTORM_QA__.getRigDiagnostics().heroine.poseState);
  expect(movingPose.speedPose).toBeGreaterThan(0.05);
  await right.dispatchEvent('pointerup', pointerUp);

  const jump = page.locator('[data-touch="jump"]');
  await jump.dispatchEvent('pointerdown', pointerDown);
  await page.waitForFunction(() => window.__GEARSTORM_QA__.getRigDiagnostics().heroine.poseState?.jumpBlend === 1);
  const jumpingPose = await page.evaluate(() => window.__GEARSTORM_QA__.getRigDiagnostics().heroine.poseState);
  expect(jumpingPose.jumpBlend).toBe(1);
  await jump.dispatchEvent('pointerup', pointerUp);

  const attack = page.locator('[data-touch="attack"]');
  await attack.dispatchEvent('pointerdown', pointerDown);
  await page.waitForFunction(() => {
    const pose = window.__GEARSTORM_QA__.getRigDiagnostics().heroine.poseState;
    return pose?.aim > 0 && pose?.recoil > 0;
  });
  const firingPose = await page.evaluate(() => window.__GEARSTORM_QA__.getRigDiagnostics().heroine.poseState);
  expect(firingPose.aim).toBeGreaterThan(0);
  expect(firingPose.recoil).toBeGreaterThan(0);
  await attack.dispatchEvent('pointerup', pointerUp);

  const dash = page.locator('[data-touch="dash"]');
  await dash.dispatchEvent('pointerdown', pointerDown);
  const dashStarted = await page.waitForFunction(() => window.__GEARSTORM_QA__.getRigDiagnostics().heroine.poseState?.dashing === true);
  expect(await dashStarted.jsonValue()).toBe(true);
  await dash.dispatchEvent('pointerup', pointerUp);

  await page.locator('#touch-pause').click();
  await expect(page.locator('#pause-screen')).toHaveClass(/active/);
  expect(await page.evaluate(() => window.__GEARSTORM_QA__.getState().state)).toBe('paused');
});
