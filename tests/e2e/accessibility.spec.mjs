import { test, expect } from '@playwright/test';

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
  expect(download.suggestedFilename()).toMatch(/^gearstorm-save-v5-\d{4}-\d{2}-\d{2}\.json$/);

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
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('gearstorm_boss_circuit_save_v5')).settings.difficulty)).toBe('casual');

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
