import { type ExecFileOptions, execFile } from "node:child_process";

import { composeFile, composeProject } from "./fixtures/database";

type CommandOptions = ExecFileOptions & { stdio?: "inherit" };

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
                `E2E global teardown command "${command}" timed out after ${timeout}ms`,
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
              `E2E global teardown command "${command}" failed: ${reason}`,
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
        new Error(`E2E global teardown command "${command}" failed: ${reason}`),
      );
    }
  });
}

async function globalTeardown() {
  try {
    await runCommand(
      "docker",
      [
        "compose",
        "--project-name",
        composeProject,
        "-f",
        composeFile,
        "down",
        "--volumes",
        "--remove-orphans",
      ],
      30_000,
      { stdio: "inherit" },
    );
  } catch (error) {
    // Best-effort cleanup: a teardown failure must not mask test results.
    console.error(`E2E teardown failed: ${String(error)}`);
  }
}

export default globalTeardown;
module.exports = globalTeardown;
