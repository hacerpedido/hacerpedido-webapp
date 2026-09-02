import { execFileSync } from "child_process";
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

async function globalSetup() {
  execFileSync(
    "docker",
    [...composeArgs, "down", "--volumes", "--remove-orphans"],
    { stdio: "inherit" },
  );
  execFileSync("docker", [...composeArgs, "up", "--detach", "--wait"], {
    stdio: "inherit",
  });
  execFileSync("npx", [...knexArgs("migrate:latest")], {
    stdio: "inherit",
    env: knexEnv,
  });
  execFileSync("npx", [...knexArgs("seed:run")], {
    stdio: "inherit",
    env: knexEnv,
  });
}

export default globalSetup;
module.exports = globalSetup;
