import { rm } from "node:fs/promises";

import { appPort, pgConnectionString } from "../tests/e2e/fixtures/database";
import setupE2EDatabase from "../tests/e2e/global-setup";
import { runPnpm } from "./e2e-runner";

async function startE2EWebServer() {
  // Playwright starts webServer before globalSetup. Prepare the disposable DB
  // here so database-backed static generation has it available during build.
  await setupE2EDatabase();

  // Do not let a development or interrupted build contaminate the production
  // artifacts consumed by next start.
  await rm(".next", { force: true, recursive: true });

  if (
    (await runPnpm(["build"], true, {
      PG_CONNECTION_STRING: pgConnectionString,
    })) !== 0
  ) {
    process.exitCode = 1;
    return;
  }

  process.exitCode = await runPnpm(["start", "-p", String(appPort)], false, {
    PG_CONNECTION_STRING: pgConnectionString,
  });
}

startE2EWebServer().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
