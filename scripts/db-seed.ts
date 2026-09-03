#!/usr/bin/env node

/**
 * Seed runner (Drizzle, replaces the Knex seed CLI).
 *
 * Usage: tsx scripts/db-seed.ts <relative-or-absolute-seed-module>
 *
 * The module must export an async `seed(db)` function. Environment:
 * PG_CONNECTION_STRING (required); env files are loaded like the former
 * knexfile.js did via @next/env.
 */

import { resolve } from "node:path";
import * as schemaNamespace from "#db/schema";

import { loadEnvConfig } from "@next/env";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

loadEnvConfig(process.cwd());

interface PoolLike {
  query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
  end: () => Promise<void>;
}

async function main(): Promise<void> {
  const seedModule = process.argv[2];
  if (!seedModule) {
    throw new Error("Usage: tsx scripts/db-seed.ts <seed-module>");
  }
  if (!process.env.PG_CONNECTION_STRING) {
    throw new Error("PG_CONNECTION_STRING is required to run seeds");
  }

  const { Pool } = require("pg") as {
    Pool: new (config: { connectionString: string }) => PoolLike;
  };
  const pool = new Pool({ connectionString: process.env.PG_CONNECTION_STRING });
  const db = drizzle({
    client: pool,
    schema: schemaNamespace,
  }) as NodePgDatabase<typeof schemaNamespace>;

  try {
    const seed = await import(resolve(process.cwd(), seedModule));
    if (typeof seed.seed !== "function") {
      throw new Error(`Seed module "${seedModule}" must export a seed(db)`);
    }
    await seed.seed(db);
    console.log(`Seed applied: ${seedModule}`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
