import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const systemChrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const localExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  || (process.platform === 'win32' && existsSync(systemChrome) ? systemChrome : undefined);
const chromiumLaunch = localExecutable ? { launchOptions: { executablePath: localExecutable } } : {};

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['line'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : 'line',
  use: {
    baseURL: 'http://127.0.0.1:8087',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'node server.js',
    url: 'http://127.0.0.1:8087',
    env: { PORT: '8087', HOST: '127.0.0.1' },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], ...chromiumLaunch } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'], ...chromiumLaunch } },
    // Opt-in via npm run test:e2e:cross-browser; the default script selects Chromium only.
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } }
  ]
});
