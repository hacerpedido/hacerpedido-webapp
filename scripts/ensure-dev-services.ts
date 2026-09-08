#!/usr/bin/env node

import { spawnSync } from "node:child_process";

type ChildResult = ReturnType<typeof spawnSync>;

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const checkOnly = process.argv.includes("--check");

function dockerIsAvailable(): boolean {
  const result = spawnSync("docker", ["info"], { stdio: "ignore" });
  return result.status === 0;
}

function executableExists(command: string): boolean {
  const result = spawnSync(command, ["version"], { stdio: "ignore" });
  const error = result.error as (Error & { code?: string }) | undefined;
  return error?.code !== "ENOENT";
}

function childExitCode(result: ChildResult): number {
  return result.status ?? 1;
}

function runningDevServices(): boolean {
  const result = spawnSync(
    "docker",
    [
      "compose",
      "-f",
      "compose.dev.yaml",
      "ps",
      "--services",
      "--status",
      "running",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );

  if (result.status !== 0) {
    return false;
  }

  const services = new Set(
    (result.stdout ?? "")
      .split(/\r?\n/)
      .map((service) => service.trim())
      .filter(Boolean),
  );

  return services.has("postgres") && services.has("s3");
}

function printTestPreflightFailure(reason: string): number {
  console.error(
    `Test preflight failed: ${reason}\nStart Docker (on macOS, run \`colima start\`), then run \`pnpm run db:up\` and retry.`,
  );
  return 1;
}

function preflightTestServices(): number {
  if (!dockerIsAvailable()) {
    return printTestPreflightFailure("Docker is unavailable");
  }

  if (!runningDevServices()) {
    return printTestPreflightFailure(
      "local PostgreSQL and VersityGW services are not running",
    );
  }

  const databaseCheck = spawnSync(pnpmCommand, ["run", "db:check"], {
    stdio: "inherit",
  });

  if (databaseCheck.status !== 0) {
    return printTestPreflightFailure("local PostgreSQL is not ready");
  }

  return 0;
}

function ensureDevServices(): number {
  let dockerAvailable = dockerIsAvailable();
  let colimaExitCode: number | undefined;

  if (
    !dockerAvailable &&
    process.platform === "darwin" &&
    executableExists("colima")
  ) {
    console.log("Docker is unavailable; starting Colima...");
    const colima = spawnSync("colima", ["start"], { stdio: "inherit" });
    colimaExitCode = colima.status === 0 ? undefined : childExitCode(colima);
    dockerAvailable = dockerIsAvailable();
  }

  if (!dockerAvailable) {
    console.error(
      "Docker is unavailable. Start Docker Desktop (or run `colima start` on macOS), then run `pnpm dev` again.",
    );
    return colimaExitCode ?? 1;
  }

  if (colimaExitCode !== undefined) {
    return colimaExitCode;
  }

  const dbUp = spawnSync(pnpmCommand, ["run", "db:up"], {
    stdio: "inherit",
  });

  return childExitCode(dbUp);
}

process.exitCode = checkOnly ? preflightTestServices() : ensureDevServices();
