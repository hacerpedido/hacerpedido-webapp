const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

if (!process.env.PG_CONNECTION_STRING) {
  throw new Error("PG_CONNECTION_STRING is required to run migrations");
}

module.exports = {
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
  migrations: {
    directory: "./db/migrations",
    tableName: "knex_migrations",
  },
  seeds: {
    directory:
      process.env.NODE_ENV === "test"
        ? "./tests/e2e/fixtures/seeds"
        : "./db/seeds/dev",
  },
};
