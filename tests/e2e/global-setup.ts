import { type ExecFileOptions, execFile } from "node:child_process";
import { resolve } from "node:path";

import {
  composeFile,
  composeProject,
  pgConnectionString,
} from "./fixtures/database";

type CommandOptions = ExecFileOptions & { stdio?: "inherit" };

const composeArgs = [
  "compose",
  "--project-name",
  composeProject,
  "-f",
  composeFile,
];

const dbEnv: NodeJS.ProcessEnv = {
  ...process.env,
  NODE_ENV: "test" as const,
  PG_CONNECTION_STRING: pgConnectionString,
};

const drizzleMigrateCommand = [
  process.execPath,
  "--import",
  "tsx",
  resolve(__dirname, "../../scripts/db-migrate.ts"),
];

async function runCommand(
  file: string,
  args: string[],
  timeout: number,
  options: CommandOptions,
): Promise<void> {
  const command = [file, ...args].join(" ");

  await new Promise<void>((resolve, reject) => {
    try {
      const child = execFile(
        file,
        args,
        { ...options, timeout, killSignal: "SIGTERM" },
        (error) => {
          if (error === null) {
            resolve();
            return;
          }

          if (error.killed) {
            reject(
              new Error(
                `E2E global setup command "${command}" timed out after ${timeout}ms`,
              ),
            );
            return;
          }

          const reason = error.signal
            ? `terminated by signal ${error.signal}`
            : typeof error.code === "number"
              ? `exited with code ${error.code}`
              : error.message;
          reject(
            new Error(
              `E2E global setup command "${command}" failed: ${reason}`,
            ),
          );
        },
      );

      if (options.stdio === "inherit") {
        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      reject(
        new Error(`E2E global setup command "${command}" failed: ${reason}`),
      );
    }
  });
}

async function globalSetup() {
  await runCommand(
    "docker",
    [...composeArgs, "down", "--volumes", "--remove-orphans"],
    30_000,
    { stdio: "inherit" },
  );
  await runCommand(
    "docker",
    [...composeArgs, "up", "--detach", "--wait"],
    90_000,
    { stdio: "inherit" },
  );
  await runCommand(
    drizzleMigrateCommand[0],
    [...drizzleMigrateCommand.slice(1), "migrate"],
    60_000,
    {
      stdio: "inherit",
      env: dbEnv,
    },
  );
  await runCommand(
    process.execPath,
    ["--import", "tsx", resolve(__dirname, "./fixtures/setup.ts")],
    60_000,
    {
      stdio: "inherit",
      env: dbEnv,
    },
  );
}

export default globalSetup;
module.exports = globalSetup;
