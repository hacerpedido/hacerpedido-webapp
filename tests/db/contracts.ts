import assert from "node:assert/strict";
import path from "node:path";

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import {
  applyBaseline,
  type Queryable,
  verifyBaseline,
} from "../../scripts/adopt-baseline";

const MIGRATIONS_FOLDER = path.resolve(__dirname, "../../db/drizzle");
const BOOKKEEPING = "drizzle.__drizzle_migrations";
const HARDENED_TIMESTAMP_FUNCTION_CONFIG = ["search_path=pg_catalog, public"];

interface PoolLike {
  query: (
    text: string,
    params?: unknown[],
  ) => Promise<{ rows: Record<string, unknown>[] }>;
  connect: () => Promise<Queryable & { release: () => void }>;
  end: () => Promise<void>;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fixtureId(suffix: number): string {
  return `90000000-0000-4000-8000-${suffix.toString().padStart(12, "0")}`;
}

async function assertPostgresError(
  callback: () => Promise<unknown>,
  code: string,
): Promise<void> {
  await assert.rejects(callback, (error: unknown) => {
    return typeof error === "object" && error !== null && "code" in error
      ? (error as { code: unknown }).code === code
      : false;
  });
}

async function assertDisposableDatabase(pool: PoolLike): Promise<void> {
  const { rows } = await pool.query("SELECT current_database() AS name");
  const databaseName: string = rows[0].name as string;
  assert.match(
    databaseName,
    /^hacerpedido_(e2e|db_contracts)$/,
    "database contract tests only run against a disposable database",
  );
}

async function migrationRows(client: Queryable): Promise<unknown[]> {
  const { rows } = await client.query(
    `SELECT hash, created_at FROM ${BOOKKEEPING} ORDER BY id ASC`,
  );
  return rows;
}

async function assertSecondaryIndexes(client: Queryable): Promise<void> {
  const { rows } = await client.query(
    `SELECT indexname, indexdef
       FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname IN (
          'idx_products_shopid_itemnumber',
          'idx_shops_public_category_updated_at',
          'idx_shops_typeformtoken'
        )
      ORDER BY indexname`,
  );
  const definitions = new Map<string, string>(
    rows.map((row) => [String(row.indexname), String(row.indexdef)]),
  );
  const expected = new Map<string, RegExp>([
    [
      "idx_products_shopid_itemnumber",
      /CREATE INDEX .* ON public\.products USING btree \(shopid, itemnumber\)/,
    ],
    [
      "idx_shops_public_category_updated_at",
      /CREATE INDEX .* ON public\.shops USING btree \(category, updated_at DESC\) WHERE \(visibility = 'public'::text\)/,
    ],
    [
      "idx_shops_typeformtoken",
      /CREATE INDEX .* ON public\.shops USING btree \(typeformtoken\)/,
    ],
  ]);

  assert.equal(definitions.size, expected.size, "secondary index count");
  for (const [name, pattern] of expected) {
    const definition = definitions.get(name);
    assert.ok(definition, `missing secondary index public.${name}`);
    assert.match(definition, pattern, `definition of public.${name}`);
  }
}

async function assertPinnedTimestampFunction(client: Queryable): Promise<void> {
  const { rows } = await client.query(
    `SELECT procedure.proconfig
       FROM pg_proc procedure
       JOIN pg_namespace schema ON schema.oid = procedure.pronamespace
      WHERE schema.nspname = 'public'
        AND procedure.proname = 'trigger_set_timestamp'`,
  );
  assert.equal(rows.length, 1, "trigger_set_timestamp function count");
  assert.deepEqual(
    rows[0].proconfig,
    HARDENED_TIMESTAMP_FUNCTION_CONFIG,
    "trigger_set_timestamp search_path must be pinned by 0003_pin_search_path",
  );
}

async function assertUuidAndPriceContract(client: Queryable): Promise<void> {
  const shopId = fixtureId(101);
  const generatedSlug = "db-contract-generated-uuid";
  const productId = fixtureId(102);

  try {
    const generated = await client.query(
      `INSERT INTO shops (name, slug, region)
       VALUES ('Database contract shop', $1, 'E2E')
       RETURNING id`,
      [generatedSlug],
    );
    const generatedId = generated.rows[0].id;
    assert.equal(typeof generatedId, "string");
    assert.match(generatedId as string, UUID_PATTERN);

    await client.query(
      `INSERT INTO shops (id, name, slug, region)
       VALUES ($1, 'Database contract explicit shop', 'db-contract-explicit-uuid', 'E2E')`,
      [shopId],
    );
    await client.query(
      `INSERT INTO products (id, shopid, category, name, price)
       VALUES ($1, $2, 'E2E', 'Opaque-price product', 'Consultar precio / 1.500,50')`,
      [productId, shopId],
    );

    const { rows } = await client.query(
      `SELECT id, shopid, price FROM products WHERE id = $1`,
      [productId],
    );
    assert.deepEqual(rows[0], {
      id: productId,
      shopid: shopId,
      price: "Consultar precio / 1.500,50",
    });
  } finally {
    await client.query("DELETE FROM products WHERE id = $1", [productId]);
    await client.query("DELETE FROM shops WHERE id = $1", [shopId]);
    await client.query("DELETE FROM shops WHERE slug = $1", [generatedSlug]);
  }
}

async function assertForeignKeyContract(client: Queryable): Promise<void> {
  const missingShopId = fixtureId(201);
  const orphanProductId = fixtureId(202);
  const shopId = fixtureId(203);
  const productId = fixtureId(204);

  await assertPostgresError(
    () =>
      client.query(
        `INSERT INTO products (id, shopid, category, name)
         VALUES ($1, $2, 'E2E', 'Orphan product')`,
        [orphanProductId, missingShopId],
      ),
    "23503",
  );

  try {
    await client.query(
      `INSERT INTO shops (id, name, slug, region)
       VALUES ($1, 'Database FK shop', 'db-contract-fk-shop', 'E2E')`,
      [shopId],
    );
    await client.query(
      `INSERT INTO products (id, shopid, category, name)
       VALUES ($1, $2, 'E2E', 'Referenced product')`,
      [productId, shopId],
    );

    await assertPostgresError(
      () => client.query("DELETE FROM shops WHERE id = $1", [shopId]),
      "23503",
    );
  } finally {
    await client.query("DELETE FROM products WHERE id = $1", [productId]);
    await client.query("DELETE FROM shops WHERE id = $1", [shopId]);
  }
}

async function assertBaselineAdoptionContract(
  client: Queryable,
): Promise<void> {
  // On a fully migrated disposable DB, the baseline is recognized as adopted.
  assert.equal(
    (await migrationRows(client)).length,
    4,
    "applied migration rows",
  );
  const dryRun = await verifyBaseline(client, { rlsMode: "e2e" });
  assert.equal(dryRun.history, "adopted");
  assert.equal(dryRun.rls, "disabled");

  // Simulate the production pre-adoption state (empty history) and re-adopt.
  await client.query(`DELETE FROM ${BOOKKEEPING}`);
  await client.query("BEGIN");
  const result = await applyBaseline(client, { rlsMode: "e2e" });
  assert.equal(result.applied, true);
  assert.equal((await migrationRows(client)).length, 1);
  await client.query("COMMIT");

  // Re-running adoption after the baseline is recorded is a no-op.
  await client.query("BEGIN");
  const again = await applyBaseline(client, { rlsMode: "e2e" });
  assert.equal(again.applied, false);
  await client.query("COMMIT");
}

export async function runDatabaseContractTests(
  connectionString: string,
): Promise<void> {
  const { Pool } = require("pg") as {
    Pool: new (config: { connectionString: string }) => PoolLike;
  };
  const pool = new Pool({ connectionString });
  const db = drizzle({ client: pool }) as NodePgDatabase;

  try {
    await assertDisposableDatabase(pool);

    // First run applies every pending migration; the second is a no-op.
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    assert.equal((await migrationRows(pool)).length, 4, "first migrate run");
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    assert.equal((await migrationRows(pool)).length, 4, "second migrate run");

    const client = await pool.connect();
    try {
      const verified = await verifyBaseline(client, { rlsMode: "e2e" });
      assert.equal(verified.history, "adopted");
      await assertSecondaryIndexes(client);
      await assertPinnedTimestampFunction(client);
      await assertUuidAndPriceContract(client);
      await assertForeignKeyContract(client);
      await assertBaselineAdoptionContract(client);
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}
