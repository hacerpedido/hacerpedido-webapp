import globalSetup from "./global-setup";

async function prepareLocalDatabase() {
  await globalSetup();
}

prepareLocalDatabase().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
