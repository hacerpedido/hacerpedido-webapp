#!/usr/bin/env node

import { runDatabaseContractTests } from "../tests/db/contracts";

async function main(): Promise<void> {
  if (!process.env.PG_CONNECTION_STRING) {
    throw new Error(
      "PG_CONNECTION_STRING is required for database contract tests",
    );
  }
  await runDatabaseContractTests(process.env.PG_CONNECTION_STRING);
  console.log("Database contract tests passed.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
