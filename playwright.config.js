// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Složka s testy.
  testDir: './tests',
  /* Run tests in files in parallel */
  // Spouští testy paralelně (rychleji, ale testy musí být izolované).
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  // Na CI zakáže test.only, aby se omylem nespustil jen jeden test.
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  // Na CI opakuje neúspěšné testy.
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  // Na CI běží sériově (stabilita), lokálně defaultní počet workerů.
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // HTML report s výsledky a případnými trasami.
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  // Sdílené nastavení pro všechny projekty/prohlížeče.
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // Základní URL, takže můžu psát page.goto('/') místo celé adresy.
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    // Trace se ukládá pouze při prvním retry (pro debug).
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  // Projekty pro hlavní prohlížeče.
  projects: [
    {
      // Chromium (Chrome engine).
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      // Firefox.
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      // WebKit (Safari engine).
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // Před testy spustí dev server.
    command: 'npm run dev',
    // URL, na kterou Playwright čeká, než začne testovat.
    url: 'http://localhost:5173',
    // Pokud už server běží, použije ho a nespouští nový.
    reuseExistingServer: !process.env.CI,
  },
});
