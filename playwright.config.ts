import { defineConfig } from "@playwright/test";
import { pgConnectionString } from "./tests/e2e/fixtures/database";

const defaultBaseURL = "http://127.0.0.1:3001";
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || defaultBaseURL;
const localHostnames = ["localhost", "127.0.0.1", "::1"];
const isExternalBaseURL = !localHostnames.includes(new URL(baseURL).hostname);

// Allow an externally provided DB (e.g. preview env) to override the local compose one.
const dbConnectionString =
  process.env.PG_CONNECTION_STRING || pgConnectionString;

module.exports = defineConfig({
  testDir: "./tests/e2e",
  globalSetup: isExternalBaseURL ? undefined : "./tests/e2e/global-setup.ts",
  globalTeardown: isExternalBaseURL
    ? undefined
    : "./tests/e2e/global-teardown.ts",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  outputDir: "test-results",
  use: {
    baseURL,
    actionTimeout: 10000,
    navigationTimeout: 30000,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  ...(isExternalBaseURL
    ? {}
    : {
        webServer: {
          command: "pnpm build && pnpm start -- -p 3001",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 180000,
          env: {
            PG_CONNECTION_STRING: dbConnectionString,
          },
        },
      }),
});
