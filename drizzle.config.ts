// Drizzle Kit configuration (migrations + schema introspection).
//
// Schema authority: `db/schema.ts`. Generated migrations land in `db/drizzle`.
// The migration bookkeeping table is `public.__drizzle_migrations` (default for
// PostgreSQL). Environment is loaded the same way as the former knexfile.js.

import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

if (!process.env.PG_CONNECTION_STRING) {
  throw new Error("PG_CONNECTION_STRING is required to run drizzle-kit");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./db/drizzle",
  dbCredentials: {
    url: process.env.PG_CONNECTION_STRING,
  },
  strict: true,
  verbose: true,
});
