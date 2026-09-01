import { execFileSync } from "child_process";

import { composeFile, composeProject } from "./fixtures/database";

async function globalTeardown() {
  execFileSync(
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
    { stdio: "inherit" },
  );
}

export default globalTeardown;
module.exports = globalTeardown;
