import { defineConfig } from "@playwright/test";
import {
  baseURL as localBaseURL,
  pgConnectionString,
  runId,
} from "./tests/e2e/fixtures/database";

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || localBaseURL;
const localHostnames = ["localhost", "127.0.0.1", "::1"];
const isExternalBaseURL = !localHostnames.includes(new URL(baseURL).hostname);

// Allow an externally provided DB (e.g. preview env) to override the local compose one.
const dbConnectionString =
  process.env.PG_CONNECTION_STRING || pgConnectionString;

// Keep single-checkout/CI artifact paths stable while isolating lane runs.
const outputDir = runId === "main" ? "test-results" : `test-results/${runId}`;
const htmlReportDir =
  runId === "main" ? "playwright-report" : `playwright-report/${runId}`;
const junitFile =
  runId === "main"
    ? "test-results/junit.xml"
    : `test-results/${runId}/junit.xml`;

module.exports = defineConfig({
  testDir: "./tests/e2e",
  globalTeardown: isExternalBaseURL
    ? undefined
    : "./tests/e2e/global-teardown.ts",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // Editor journeys mutate the shared seeded catalog. Run serially so their
  // state cannot leak into the public storefront journeys.
  workers: 1,
  fullyParallel: false,
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: [
    ["html", { outputFolder: htmlReportDir, open: "never" }],
    ["junit", { outputFile: junitFile }],
  ],
  outputDir,
  use: {
    baseURL,
    actionTimeout: process.env.CI ? 5000 : 10000,
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
          // Playwright starts webServer before globalSetup. This command
          // prepares the E2E database, then makes a clean production build.
          command: "tsx scripts/e2e-web-server.ts",
          // The home page queries PostgreSQL during SSR. Probe the client-only
          // cart route instead so the server is considered ready without
          // racing database startup.
          url: `${baseURL}/cart`,
          // E2E must exercise the build above, not a developer's server that
          // happens to be listening on the same port.
          reuseExistingServer: false,
          timeout: 180000,
          stderr: "pipe",
          env: {
            PG_CONNECTION_STRING: dbConnectionString,
          },
        },
      }),
});
