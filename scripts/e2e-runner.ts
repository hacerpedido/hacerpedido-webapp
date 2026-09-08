import { spawn } from "node:child_process";

/**
 * Run a pnpm command, optionally detaching and forwarding termination signals.
 * Pass `env` to inject environment variables (for example the database
 * connection string required by database-backed builds and the app server).
 */
export function runPnpm(
  args: string[],
  waitForExit = true,
  env: Record<string, string | undefined> = {},
): Promise<number> {
  const child = spawn("pnpm", args, {
    env: {
      ...process.env,
      ...env,
    },
    stdio: "inherit",
  });

  if (!waitForExit) {
    for (const signal of ["SIGINT", "SIGTERM"] as const) {
      process.once(signal, () => child.kill(signal));
    }
  }

  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`pnpm ${args.join(" ")} was terminated by ${signal}`));
        return;
      }
      resolve(code ?? 1);
    });
  });
}
