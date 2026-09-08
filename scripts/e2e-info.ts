#!/usr/bin/env node

import { computeE2EContext } from "../tests/e2e/fixtures/run-context";

const context = computeE2EContext();

console.log("E2E run context");
console.log(`  checkout        ${process.cwd()}`);
console.log(`  lane            ${context.isLane ? "yes" : "no"}`);
console.log(`  run id          ${context.runId}`);
console.log(`  compose project ${context.projectName}`);
console.log(`  volume prefix   ${context.volumePrefix}`);
console.log(`  postgres port   ${context.pgPort}`);
console.log(`  app port        ${context.appPort}`);
console.log(`  base url        ${context.baseURL}`);
console.log(
  `  connection      ${context.pgConnectionString.replace(/\/\/[^@]+@/, "//***@")}`,
);
console.log("Override with E2E_RUN_ID, E2E_PROJECT_NAME, E2E_PG_PORT,");
console.log("E2E_APP_PORT, or E2E_VOLUME_PREFIX.");
