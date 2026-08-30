const { defineConfig } = require('@playwright/test');
const { pgConnectionString } = require('./tests/e2e/fixtures/database');

const defaultBaseURL = 'http://127.0.0.1:3000';
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || defaultBaseURL;
const localHostnames = ['localhost', '127.0.0.1', '::1'];
const isExternalBaseURL = !localHostnames.includes(new URL(baseURL).hostname);

// Allow an externally provided DB (e.g. preview env) to override the local compose one.
const dbConnectionString = process.env.PG_CONNECTION_STRING || pgConnectionString;

module.exports = defineConfig({
  testDir: './tests/e2e',
  globalSetup: isExternalBaseURL
    ? undefined
    : require.resolve('./tests/e2e/global-setup.js'),
  globalTeardown: isExternalBaseURL
    ? undefined
    : require.resolve('./tests/e2e/global-teardown.js'),
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  outputDir: 'test-results',
  use: {
    baseURL,
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  ...(isExternalBaseURL
    ? {}
    : {
        webServer: {
          command: 'npm run build && npm run start',
          url: baseURL,
          reuseExistingServer: false,
          env: {
            PG_CONNECTION_STRING: dbConnectionString,
          },
        },
      }),
});
