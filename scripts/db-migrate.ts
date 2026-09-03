#!/usr/bin/env node

/**
 * Database migration runner (Drizzle, replaces the Knex CLI).
 *
 * Applies the versioned SQL migrations under `db/drizzle` in order, recording
 * each one in `drizzle.__drizzle_migrations`. Usage:
 *
 *   tsx scripts/db-migrate.ts            # apply pending migrations
 *   tsx scripts/db-migrate.ts status     # list applied/pending migrations
 *
 * Environment: PG_CONNECTION_STRING (required). Env files are loaded like the
 * former knexfile.js did via @next/env.
 */

import { resolve } from "node:path";

import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

loadEnvConfig(process.cwd());

const MIGRATIONS_FOLDER = resolve(process.cwd(), "db/drizzle");
const BOOKKEEPING_SCHEMA = "drizzle";
const BOOKKEEPING_TABLE = "__drizzle_migrations";

interface PoolLike {
  query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
  end: () => Promise<void>;
}

function getPool(): PoolLike {
  if (!process.env.PG_CONNECTION_STRING) {
    throw new Error("PG_CONNECTION_STRING is required to run migrations");
  }
  // pg has no bundled type declarations in this repository; structural typing
  // keeps this script consistent with lib/db/pool.ts.
  const { Pool } = require("pg") as {
    Pool: new (config: { connectionString: string }) => PoolLike;
  };
  return new Pool({ connectionString: process.env.PG_CONNECTION_STRING });
}

async function runMigrationStatus(pool: PoolLike): Promise<void> {
  const journal = (await import("node:fs")).readFileSync(
    resolve(MIGRATIONS_FOLDER, "meta/_journal.json"),
    "utf8",
  );
  const entries: { tag: string; when: number }[] = JSON.parse(journal).entries;

  const { rows } = await pool.query(
    `SELECT hash, created_at
       FROM ${BOOKKEEPING_SCHEMA}.${BOOKKEEPING_TABLE}
      ORDER BY created_at DESC`,
  );

  const applied = new Set(
    (rows as { created_at: number }[]).map((row) => Number(row.created_at)),
  );

  let pendingCount = 0;
  for (const entry of entries) {
    const isPending = !applied.has(entry.when);
    if (isPending) pendingCount += 1;
    console.log(`${isPending ? "pending " : "applied "} ${entry.tag}`);
  }
  console.log(
    `${entries.length - pendingCount}/${entries.length} migrations applied`,
  );
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? "migrate";
  const pool = getPool();

  try {
    if (command === "status") {
      await runMigrationStatus(pool);
      return;
    }
    if (command !== "migrate") {
      throw new Error(
        `Unknown command "${command}". Expected "migrate" or "status".`,
      );
    }
    const db = drizzle({ client: pool });
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    console.log("Migrations up to date.");
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
