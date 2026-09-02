const assert = require("node:assert/strict");
const path = require("node:path");

const knexFactory = require("knex");

const {
  BASELINE_MIGRATION,
  applyBaseline,
  verifyBaseline,
} = require("../../scripts/adopt-baseline.js");

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
  const before = await knex("knex_migrations")
    .select("name")
    .orderBy("id", "asc");
  assert.deepEqual(before, [{ name: BASELINE_MIGRATION }]);

  const dryRun = await verifyBaseline(knex, { rlsMode: "e2e" });
  assert.equal(dryRun.history, "adopted");
  assert.equal(dryRun.rls, "disabled");

  await knex("knex_migrations").where("name", BASELINE_MIGRATION).del();
  try {
    const result = await applyBaseline(knex, { rlsMode: "e2e" });
    assert.equal(result.applied, true);
    const history = await knex("knex_migrations")
      .select("name")
      .orderBy("id", "asc");
    assert.deepEqual(history, [{ name: BASELINE_MIGRATION }]);
  } catch (error) {
    await knex("knex_migrations").insert({
      name: BASELINE_MIGRATION,
      batch: 1,
      migration_time: new Date(),
    });
    throw error;
  }
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
    assert.deepEqual(firstRun[1], [BASELINE_MIGRATION]);

    const secondRun = await knex.migrate.latest();
    assert.deepEqual(secondRun[1], []);

    await assertUuidAndPriceContract(knex);
    await assertForeignKeyContract(knex);
    await assertBaselineAdoptionContract(knex);
  } finally {
    await knex.destroy();
  }
}

module.exports = { runDatabaseContractTests };
