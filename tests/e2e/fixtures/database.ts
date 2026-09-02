import path from "path";

// CommonJS helper shared with Node scripts; see run-context.js for resolution.
const { computeE2EContext } = require("./run-context");

const composeFilePath = path.resolve(__dirname, "../../../compose.e2e.yaml");

const context = computeE2EContext();

// Make derived settings visible to child processes (docker compose
// interpolation, migrations, and the app server inherit process.env).
process.env.E2E_PG_PORT ??= String(context.pgPort);
process.env.E2E_APP_PORT ??= String(context.appPort);
process.env.E2E_PROJECT_NAME ??= context.projectName;
process.env.E2E_VOLUME_PREFIX ??= context.volumePrefix;

export const databaseConfig = {
  composeFile: composeFilePath,
  composeProject: context.projectName,
  pgConnectionString: context.pgConnectionString,
  pgPort: context.pgPort,
  appPort: context.appPort,
  baseURL: context.baseURL,
  runId: context.runId,
  isLane: context.isLane,
};

export const {
  composeFile,
  composeProject,
  pgConnectionString,
  pgPort,
  appPort,
  baseURL,
  runId,
  isLane,
} = databaseConfig;
