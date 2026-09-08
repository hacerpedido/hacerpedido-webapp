import { rm } from "node:fs/promises";

import { pgConnectionString } from "../tests/e2e/fixtures/database";
import setupE2EDatabase from "../tests/e2e/global-setup";
import { runPnpm } from "./e2e-runner";

/**
 * Provision the disposable E2E database, then run a clean production build.
 * The build prerenders database-backed pages (for example the sitemap), so it
 * needs a seeded database available. Used by the CI `build` job.
 */
async function buildE2E() {
  await setupE2EDatabase();

  // Do not let a development or interrupted build contaminate the artifacts.
  await rm(".next", { force: true, recursive: true });

  process.exitCode = await runPnpm(["build"], true, {
    PG_CONNECTION_STRING: pgConnectionString,
  });
}

buildE2E().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
