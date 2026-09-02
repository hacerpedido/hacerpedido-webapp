#!/usr/bin/env node

const { runDatabaseContractTests } = require("../tests/db/contracts.js");

async function main() {
  if (!process.env.PG_CONNECTION_STRING) {
    throw new Error(
      "PG_CONNECTION_STRING is required for database contract tests",
    );
  }
  await runDatabaseContractTests(process.env.PG_CONNECTION_STRING);
  console.log("Database contract tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
