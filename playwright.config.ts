import { defineConfig } from '@playwright/test';
import { release } from 'node:os';

const renderingPlatform = `${process.platform}-${release().split('.')[0]}-${process.arch}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 30_000, // Whole scenario budget; each individual condition is capped below.
  expect: { timeout: 2000, toHaveScreenshot: { maxDiffPixels: 0, threshold: 0, animations: 'disabled' } },
  reporter: [['list'], ['html', { open: 'never' }]],
  metadata: { renderingPlatform },
  snapshotPathTemplate: `{testDir}/{testFileDir}/screenshots/{projectName}/${renderingPlatform}/{arg}{ext}`,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    actionTimeout: 2000,
    navigationTimeout: 2000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
    locale: 'en-CA',
    timezoneId: 'America/Toronto',
    launchOptions: { args: [
      '--disable-gpu', '--use-gl=swiftshader', '--font-render-hinting=none',
      '--disable-font-subpixel-positioning', '--disable-lcd-text',
      '--disable-accelerated-2d-canvas', '--disable-smooth-scrolling',
    ] },
  },
  projects: [
    { name: 'phone', use: { browserName: 'chromium', viewport: { width: 393, height: 852 } } },
    { name: 'laptop', use: { browserName: 'chromium', viewport: { width: 1280, height: 900 } } },
    { name: 'tablet', use: { browserName: 'chromium', viewport: { width: 1024, height: 1366 } } },
    { name: 'tabletop', use: { browserName: 'chromium', viewport: { width: 1920, height: 1080 } } },
  ],
  webServer: {
    command: 'npm run dev', url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI, timeout: 2000, env: { VITE_EMULATORS: 'true' },
  },
});
