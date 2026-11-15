import { defineConfig, devices } from '@playwright/test';

// Every page is checked in light AND dark on desktop browsers (Chromium, Firefox, WebKit/Safari engine),
// phones (Android Chrome, iPhone Safari), a tablet, a tiny 320px screen and a 2560px screen.
// CI runs the same suite on Linux, Windows and macOS (.github/workflows/e2e.yml).
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]],
  use: { baseURL: 'http://localhost:4173/NAIC/hallofbuilders/hall/', trace: 'off', screenshot: 'only-on-failure' },
  webServer: { command: 'npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173/NAIC/hallofbuilders/hall/', reuseExistingServer: true },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'android-pixel7', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-14', use: { ...devices['iPhone 14'] } },
    { name: 'ipad-mini', use: { ...devices['iPad Mini'] } },
    { name: 'small-320', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 640 } } },
    { name: 'wide-2560', use: { ...devices['Desktop Chrome'], viewport: { width: 2560, height: 1440 } } },
  ],
});
