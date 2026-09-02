const assert = require("node:assert/strict");
const path = require("node:path");

const knexFactory = require("knex");

const {
  BASELINE_MIGRATION,
  applyBaseline,
  verifyBaseline,
} = require("../../scripts/adopt-baseline.js");

const INDEX_MIGRATION = "0002_add_secondary_indexes.js";
const PIN_MIGRATION = "0003_pin_trigger_search_path.js";
const ALL_MIGRATIONS = [BASELINE_MIGRATION, INDEX_MIGRATION, PIN_MIGRATION];
const HARDENED_TIMESTAMP_FUNCTION_CONFIG = ["search_path=pg_catalog, public"];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fixtureId(suffix) {
  return `90000000-0000-4000-8000-${suffix.toString().padStart(12, "0")}`;
}

async function assertPostgresError(callback, code) {
  await assert.rejects(callback, (error) => error && error.code === code);
}

async function assertDisposableDatabase(knex) {
  const { rows } = await knex.raw("SELECT current_database() AS name");
  const databaseName = rows[0].name;
  assert.match(
    databaseName,
    /^hacerpedido_(e2e|db_contracts)$/,
    "database contract tests only run against a disposable database",
  );
}

async function migrationNames(knex) {
  const { rows } = await knex.raw(
    "SELECT name FROM public.knex_migrations ORDER BY name ASC",
  );
  return rows.map((row) => row.name);
}

async function assertSecondaryIndexes(knex) {
  const { rows } = await knex.raw(
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
  const definitions = new Map(rows.map((row) => [row.indexname, row.indexdef]));
  const expected = new Map([
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

async function assertPinnedTimestampFunction(knex) {
  const { rows } = await knex.raw(
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
    "trigger_set_timestamp search_path must be pinned by 0003_pin_trigger_search_path",
  );
}

async function assertUuidAndPriceContract(knex) {
  const shopId = fixtureId(101);
  const generatedSlug = "db-contract-generated-uuid";
  const productId = fixtureId(102);

  try {
    const [shop] = await knex("shops")
      .insert({
        name: "Database contract shop",
        slug: generatedSlug,
        region: "E2E",
      })
      .returning(["id"]);
    assert.equal(typeof shop.id, "string");
    assert.match(shop.id, UUID_PATTERN);

    await knex("shops").insert({
      id: shopId,
      name: "Database contract explicit shop",
      slug: "db-contract-explicit-uuid",
      region: "E2E",
    });
    await knex("products").insert({
      id: productId,
      shopid: shopId,
      category: "E2E",
      name: "Opaque-price product",
      price: "Consultar precio / 1.500,50",
    });

    const row = await knex("products")
      .select("id", "shopid", "price")
      .where("id", productId)
      .first();
    assert.deepEqual(row, {
      id: productId,
      shopid: shopId,
      price: "Consultar precio / 1.500,50",
    });
    assert.equal(typeof row.id, "string");
    assert.equal(typeof row.shopid, "string");
    assert.equal(typeof row.price, "string");
  } finally {
    await knex("products").where("id", productId).del();
    await knex("shops").whereIn("id", [shopId]).del();
    await knex("shops").where("slug", generatedSlug).del();
  }
}

async function assertForeignKeyContract(knex) {
  const missingShopId = fixtureId(201);
  const orphanProductId = fixtureId(202);
  const shopId = fixtureId(203);
  const productId = fixtureId(204);

  await assertPostgresError(
    () =>
      knex("products").insert({
        id: orphanProductId,
        shopid: missingShopId,
        category: "E2E",
        name: "Orphan product",
      }),
    "23503",
  );

  try {
    await knex("shops").insert({
      id: shopId,
      name: "Database FK shop",
      slug: "db-contract-fk-shop",
      region: "E2E",
    });
    await knex("products").insert({
      id: productId,
      shopid: shopId,
      category: "E2E",
      name: "Referenced product",
    });

    await assertPostgresError(
      () => knex("shops").where("id", shopId).del(),
      "23503",
    );
  } finally {
    await knex("products").where("id", productId).del();
    await knex("shops").where("id", shopId).del();
  }
}

async function assertBaselineAdoptionContract(knex) {
  // On a fully migrated disposable DB, verify the baseline is recognized as
  // adopted even when versioned forward migrations follow it.
  assert.deepEqual(await migrationNames(knex), ALL_MIGRATIONS);
  const dryRun = await verifyBaseline(knex, { rlsMode: "e2e" });
  assert.equal(dryRun.history, "adopted");
  assert.equal(dryRun.rls, "disabled");

  // Simulate the production pre-adoption state (empty history) and re-adopt.
  await knex.raw("DELETE FROM public.knex_migrations");
  const result = await applyBaseline(knex, { rlsMode: "e2e" });
  assert.equal(result.applied, true);
  assert.deepEqual(await migrationNames(knex), [BASELINE_MIGRATION]);

  // Re-running adoption after the baseline is recorded is a no-op.
  const again = await applyBaseline(knex, { rlsMode: "e2e" });
  assert.equal(again.applied, false);
}

async function runDatabaseContractTests(connectionString) {
  const knex = knexFactory({
    client: "pg",
    connection: connectionString,
    migrations: {
      directory: path.resolve(__dirname, "../../db/migrations"),
      tableName: "knex_migrations",
    },
  });

  try {
    await assertDisposableDatabase(knex);

    const firstRun = await knex.migrate.latest();
    assert.deepEqual(firstRun[1], ALL_MIGRATIONS);

    const secondRun = await knex.migrate.latest();
    assert.deepEqual(secondRun[1], []);

    await assertSecondaryIndexes(knex);
    await assertPinnedTimestampFunction(knex);
    await assertUuidAndPriceContract(knex);
    await assertForeignKeyContract(knex);
    await assertBaselineAdoptionContract(knex);
  } finally {
    await knex.destroy();
  }
}

module.exports = { runDatabaseContractTests };
