const crypto = require("node:crypto");

/**
 * Shared run identity for the E2E and development Compose stacks.
 *
 * The whole E2E harness (Compose project, PostgreSQL host port, app port,
 * volume prefix, connection string) is derived from a single run id so that
 * concurrent Git worktrees never share containers, ports, or databases.
 *
 * Resolution rules (first match wins):
 *  1. Explicit environment overrides (E2E_PROJECT_NAME, E2E_PG_PORT,
 *     E2E_APP_PORT, E2E_VOLUME_PREFIX, E2E_RUN_ID).
 *  2. A lane id derived from the working directory when the checkout lives
 *     under a worktree lane (`.slim/worktrees/<lane>` or any `worktrees/`
 *     directory). Each lane gets deterministic ports and resources.
 *  3. The documented defaults (`hacerpedido-e2e`, port 54329, app 3001),
 *     preserving single-checkout/CI behavior exactly.
 */

const E2E_DEFAULTS = {
  projectName: "hacerpedido-e2e",
  pgPort: 54329,
  appPort: 3001,
  volumePrefix: "hacerpedido_e2e",
  dbName: "hacerpedido_e2e",
  dbUser: "e2e_user",
  dbPassword: "e2e_password",
  pgHost: "127.0.0.1",
};

const BASE_LANE_PG_PORT = 54400;
const BASE_LANE_APP_PORT = 3200;
const LANE_PORT_RANGE = 100;

function isWorktreePath(cwd) {
  return /[\\/](?:\.slim[\\/]worktrees|worktrees)[\\/]/.test(cwd);
}

function sanitizeRunId(value) {
  const sanitized = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-");
  return sanitized || "lane";
}

function deriveLaneId(cwd) {
  const digest = crypto.createHash("sha1").update(cwd).digest("hex");
  return `wt-${digest.slice(0, 8)}`;
}

function lanePortOffset(runId) {
  const digest = crypto.createHash("sha1").update(runId).digest("hex");
  return parseInt(digest.slice(0, 4), 16) % LANE_PORT_RANGE;
}

function resolvePort(envValue, base, runId) {
  if (envValue) return Number(envValue);
  return base + lanePortOffset(runId);
}

function computeE2EContext(env = process.env, cwd = process.cwd()) {
  const explicitRunId = env.E2E_RUN_ID && env.E2E_RUN_ID !== "main";
  const isLane = Boolean(explicitRunId) || isWorktreePath(cwd);

  if (!isLane) {
    const runId = "main";
    const defaults = E2E_DEFAULTS;
    const pgPort = env.E2E_PG_PORT ? Number(env.E2E_PG_PORT) : defaults.pgPort;
    const appPort = env.E2E_APP_PORT
      ? Number(env.E2E_APP_PORT)
      : defaults.appPort;
    return {
      runId,
      isLane: false,
      projectName: env.E2E_PROJECT_NAME || defaults.projectName,
      volumePrefix: env.E2E_VOLUME_PREFIX || defaults.volumePrefix,
      pgPort,
      appPort,
      baseURL: `http://127.0.0.1:${appPort}`,
      pgConnectionString: `postgresql://${defaults.dbUser}:${defaults.dbPassword}@${defaults.pgHost}:${pgPort}/${defaults.dbName}`,
    };
  }

  const runId = sanitizeRunId(explicitRunId || deriveLaneId(cwd));
  const projectName = env.E2E_PROJECT_NAME || `hacerpedido-e2e-${runId}`;
  const volumePrefix = env.E2E_VOLUME_PREFIX || `hacerpedido_e2e_${runId}`;
  const pgPort = resolvePort(env.E2E_PG_PORT, BASE_LANE_PG_PORT, runId);
  const appPort = resolvePort(env.E2E_APP_PORT, BASE_LANE_APP_PORT, runId);

  return {
    runId,
    isLane: true,
    projectName,
    volumePrefix,
    pgPort,
    appPort,
    baseURL: `http://127.0.0.1:${appPort}`,
    pgConnectionString: `postgresql://${E2E_DEFAULTS.dbUser}:${E2E_DEFAULTS.dbPassword}@${E2E_DEFAULTS.pgHost}:${pgPort}/${E2E_DEFAULTS.dbName}`,
  };
}

module.exports = { computeE2EContext, isWorktreePath };
