import { type ChildProcess, type SpawnOptions, spawn } from "child_process";
import { resolve } from "path";

import {
  composeFile,
  composeProject,
  pgConnectionString,
} from "./fixtures/database";

const composeArgs = [
  "compose",
  "--project-name",
  composeProject,
  "-f",
  composeFile,
];

const knexEnv: NodeJS.ProcessEnv = {
  ...process.env,
  NODE_ENV: "test" as const,
  PG_CONNECTION_STRING: pgConnectionString,
};

const knexArgs = (command: string) => [
  "knex",
  "--knexfile",
  resolve(__dirname, "../../knexfile.js"),
  command,
];

const terminationGracePeriod = 2_000;

function signalProcessGroup(pid: number | undefined, signal: NodeJS.Signals) {
  if (pid === undefined) {
    return;
  }

  try {
    process.kill(-pid, signal);
  } catch {
    // The process may have exited between the timeout and the signal.
  }
}

async function runCommand(
  file: string,
  args: string[],
  timeout: number,
  options: SpawnOptions,
): Promise<void> {
  const command = [file, ...args].join(" ");

  await new Promise<void>((resolve, reject) => {
    let child: ChildProcess;
    try {
      child = spawn(file, args, { ...options, detached: true });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      reject(
        new Error(`E2E global setup command "${command}" failed: ${reason}`),
      );
      return;
    }

    let timedOut = false;
    let childClosed = false;
    let killSent = false;
    let spawnError: Error | undefined;
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
    let killTimer: ReturnType<typeof setTimeout> | undefined;

    const clearTimers = () => {
      if (timeoutTimer !== undefined) {
        clearTimeout(timeoutTimer);
      }
      if (killTimer !== undefined) {
        clearTimeout(killTimer);
      }
    };

    child.once("error", (error) => {
      spawnError = error instanceof Error ? error : new Error(String(error));
    });
    child.once("close", (code, signal) => {
      childClosed = true;

      if (timedOut) {
        if (killSent) {
          clearTimers();
          reject(
            new Error(
              `E2E global setup command "${command}" timed out after ${timeout}ms`,
            ),
          );
        }
        return;
      }

      clearTimers();

      if (spawnError !== undefined) {
        reject(
          new Error(
            `E2E global setup command "${command}" failed: ${spawnError.message}`,
          ),
        );
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      const reason = signal
        ? `terminated by signal ${signal}`
        : `exited with code ${code}`;
      reject(
        new Error(`E2E global setup command "${command}" failed: ${reason}`),
      );
    });

    timeoutTimer = setTimeout(() => {
      timedOut = true;
      signalProcessGroup(child.pid, "SIGTERM");
      killTimer = setTimeout(() => {
        killSent = true;
        signalProcessGroup(child.pid, "SIGKILL");
        if (childClosed) {
          clearTimers();
          reject(
            new Error(
              `E2E global setup command "${command}" timed out after ${timeout}ms`,
            ),
          );
        }
      }, terminationGracePeriod);
    }, timeout);
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
  await runCommand("npx", [...knexArgs("migrate:latest")], 60_000, {
    stdio: "inherit",
    env: knexEnv,
  });
  await runCommand("npx", [...knexArgs("seed:run")], 60_000, {
    stdio: "inherit",
    env: knexEnv,
  });
}

export default globalSetup;
module.exports = globalSetup;
