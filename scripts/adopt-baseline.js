#!/usr/bin/env node

const knexFactory = require("knex");

const BASELINE_MIGRATION = "0001_baseline.js";
const ADVISORY_LOCK_KEY = "hacerpedido:baseline-adoption:v1";
const RLS_MODES = new Set(["auto", "production", "e2e"]);
const HARDENED_TIMESTAMP_FUNCTION_CONFIG = ["search_path=pg_catalog, public"];

const expectedColumns = [
  ["shops", "id", "uuid", "NO", "uuid"],
  ["shops", "name", "text", "NO", null],
  ["shops", "slug", "text", "NO", null],
  ["shops", "region", "text", "NO", null],
  ["shops", "username", "text", "YES", null],
  ["shops", "category", "text", "YES", null],
  ["shops", "address", "text", "YES", null],
  ["shops", "notes", "text", "YES", null],
  ["shops", "ordersbyphoneorwhatsapp", "text", "YES", null],
  ["shops", "delivery", "text", "YES", null],
  ["shops", "takeaway", "text", "YES", null],
  ["shops", "whatsappnumber", "text", "YES", null],
  ["shops", "phonenumber", "text", "YES", null],
  ["shops", "email", "text", "YES", null],
  ["shops", "submittedat", "text", "YES", null],
  ["shops", "opentimes", "text", "YES", null],
  ["shops", "deliverycost", "text", "YES", null],
  ["shops", "visibility", "text", "YES", null],
  ["shops", "logo", "text", "YES", null],
  ["shops", "background", "text", "YES", null],
  ["shops", "typeformtoken", "text", "YES", null],
  ["shops", "ordersphonenumber", "text", "YES", null],
  ["shops", "orderswhatsappnumber", "text", "YES", null],
  ["shops", "created_at", "timestamp without time zone", "YES", "now"],
  ["shops", "updated_at", "timestamp without time zone", "YES", "now"],
  ["products", "id", "uuid", "NO", "uuid"],
  ["products", "category", "text", "NO", null],
  ["products", "name", "text", "NO", null],
  ["products", "description", "text", "YES", null],
  ["products", "price", "text", "YES", null],
  ["products", "shopid", "uuid", "NO", null],
  ["products", "itemnumber", "integer", "YES", null],
  ["products", "created_at", "timestamp without time zone", "YES", "now"],
  ["products", "updated_at", "timestamp without time zone", "YES", "now"],
];

function fail(message) {
  throw new Error(`Baseline adoption refused: ${message}`);
}

function normalize(value) {
  return String(value).replaceAll(/\s+/g, "").toLowerCase();
}

function matchesDefault(actual, expected) {
  if (expected === null) return actual === null;
  if (typeof actual !== "string") return false;

  const normalized = normalize(actual);
  if (expected === "now") return normalized === "now()";
  return /(?:^|\.)(?:uuid_generate_v1)\(\)$/.test(normalized);
}

function assertEqual(actual, expected, description) {
  if (actual !== expected) {
    fail(
      `${description}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function hasApprovedTimestampFunctionConfig(config) {
  if (config === null) return true;
  if (!Array.isArray(config)) return false;
  return (
    config.length === HARDENED_TIMESTAMP_FUNCTION_CONFIG.length &&
    config.every(
      (value, index) => value === HARDENED_TIMESTAMP_FUNCTION_CONFIG[index],
    )
  );
}

async function migrationHistory(knex) {
  const table = await knex.raw(
    "SELECT to_regclass('public.knex_migrations') AS name",
  );
  if (table.rows[0].name === null) {
    fail(
      "public.knex_migrations does not exist; initialize Knex metadata before adoption",
    );
  }

  const { rows } = await knex.raw(
    "SELECT name FROM public.knex_migrations ORDER BY id ASC",
  );
  const names = rows.map((row) => row.name);

  if (names.length === 0) return "empty";
  if (names.length === 1 && names[0] === BASELINE_MIGRATION) {
    return "adopted";
  }

  fail(
    `unexpected Knex history ${JSON.stringify(names)}; expected [] or [${JSON.stringify(BASELINE_MIGRATION)}]`,
  );
}

async function verifyColumns(knex) {
  const { rows } = await knex.raw(
    `SELECT table_name, column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name IN ('shops', 'products')
      ORDER BY table_name, ordinal_position`,
  );
  const actual = new Map(
    rows.map((row) => [`${row.table_name}.${row.column_name}`, row]),
  );

  assertEqual(
    actual.size,
    expectedColumns.length,
    "shops/products column count",
  );
  for (const [table, column, type, nullable, defaultKind] of expectedColumns) {
    const row = actual.get(`${table}.${column}`);
    if (!row) fail(`missing column public.${table}.${column}`);
    assertEqual(row.data_type, type, `type of public.${table}.${column}`);
    assertEqual(
      row.is_nullable,
      nullable,
      `nullability of public.${table}.${column}`,
    );
    if (!matchesDefault(row.column_default, defaultKind)) {
      fail(
        `default of public.${table}.${column}: expected ${defaultKind ?? "none"}, got ${JSON.stringify(row.column_default)}`,
      );
    }
  }
}

async function verifyConstraints(knex) {
  const { rows } = await knex.raw(
    `SELECT con.conname, con.contype, source.relname AS table_name,
            target.relname AS target_table, con.confdeltype, con.confupdtype,
            con.condeferrable, con.convalidated, pg_get_constraintdef(con.oid) AS definition
       FROM pg_constraint con
       JOIN pg_class source ON source.oid = con.conrelid
       JOIN pg_namespace schema ON schema.oid = source.relnamespace
       LEFT JOIN pg_class target ON target.oid = con.confrelid
      WHERE schema.nspname = 'public' AND source.relname IN ('shops', 'products')
      ORDER BY source.relname, con.conname`,
  );
  const actual = new Map(rows.map((row) => [row.conname, row]));
  const expected = [
    ["shops_pkey", "p", "shops"],
    ["shops_slug_key", "u", "shops"],
    ["products_pkey", "p", "products"],
    ["products_shopid_fkey", "f", "products"],
  ];

  assertEqual(actual.size, expected.length, "shops/products constraint count");
  for (const [name, type, table] of expected) {
    const row = actual.get(name);
    if (!row) fail(`missing constraint public.${name}`);
    assertEqual(row.contype, type, `type of constraint public.${name}`);
    assertEqual(row.table_name, table, `table of constraint public.${name}`);
  }

  const foreignKey = actual.get("products_shopid_fkey");
  assertEqual(foreignKey.target_table, "shops", "products shop FK target");
  assertEqual(foreignKey.confdeltype, "a", "products shop FK delete action");
  assertEqual(foreignKey.confupdtype, "a", "products shop FK update action");
  assertEqual(
    foreignKey.condeferrable,
    false,
    "products shop FK deferrability",
  );
  assertEqual(foreignKey.convalidated, true, "products shop FK validity");
  if (
    !/foreignkey\(shopid\)references(?:public\.)?shops\(id\)/.test(
      normalize(foreignKey.definition),
    )
  ) {
    fail(
      `unexpected products shop FK definition ${JSON.stringify(foreignKey.definition)}`,
    );
  }
}

async function verifyTriggers(knex) {
  const { rows } = await knex.raw(
    `SELECT trigger.tgname, target.relname AS table_name, trigger.tgenabled,
            pg_get_triggerdef(trigger.oid) AS definition,
            procedure.proname AS function_name, function_schema.nspname AS function_schema
       FROM pg_trigger trigger
       JOIN pg_class target ON target.oid = trigger.tgrelid
       JOIN pg_namespace table_schema ON table_schema.oid = target.relnamespace
       JOIN pg_proc procedure ON procedure.oid = trigger.tgfoid
       JOIN pg_namespace function_schema ON function_schema.oid = procedure.pronamespace
      WHERE NOT trigger.tgisinternal AND table_schema.nspname = 'public'
        AND target.relname IN ('shops', 'products')
      ORDER BY target.relname, trigger.tgname`,
  );

  assertEqual(rows.length, 2, "shops/products trigger count");
  for (const row of rows) {
    assertEqual(
      row.tgname,
      "set_timestamp",
      `trigger name on ${row.table_name}`,
    );
    assertEqual(
      row.tgenabled,
      "O",
      `trigger enabled state on ${row.table_name}`,
    );
    assertEqual(
      row.function_schema,
      "public",
      `trigger function schema on ${row.table_name}`,
    );
    assertEqual(
      row.function_name,
      "trigger_set_timestamp",
      `trigger function on ${row.table_name}`,
    );
    if (
      !/beforeupdateon(?:public\.)?(shops|products)foreachrowexecutefunction(?:public\.)?trigger_set_timestamp\(\)/.test(
        normalize(row.definition),
      )
    ) {
      fail(`unexpected trigger definition ${JSON.stringify(row.definition)}`);
    }
  }
}

async function verifyFunctions(knex) {
  const { rows } = await knex.raw(
    `SELECT procedure.proname, pg_get_function_result(procedure.oid) AS result,
            language.lanname AS language, procedure.prosrc, procedure.proconfig,
            procedure.prosecdef
       FROM pg_proc procedure
       JOIN pg_namespace schema ON schema.oid = procedure.pronamespace
       JOIN pg_language language ON language.oid = procedure.prolang
      WHERE schema.nspname = 'public'
        AND procedure.proname IN ('trigger_set_timestamp', 'rls_auto_enable')
      ORDER BY procedure.proname`,
  );
  const functions = new Map(rows.map((row) => [row.proname, row]));
  assertEqual(functions.size, 2, "baseline function count");

  const timestamp = functions.get("trigger_set_timestamp");
  if (!timestamp) fail("missing function public.trigger_set_timestamp()");
  assertEqual(timestamp.result, "trigger", "trigger_set_timestamp return type");
  assertEqual(timestamp.language, "plpgsql", "trigger_set_timestamp language");
  assertEqual(
    timestamp.prosecdef,
    false,
    "trigger_set_timestamp security mode",
  );
  if (!hasApprovedTimestampFunctionConfig(timestamp.proconfig)) {
    fail(
      `trigger_set_timestamp function configuration must be null or ${JSON.stringify(HARDENED_TIMESTAMP_FUNCTION_CONFIG)}, got ${JSON.stringify(timestamp.proconfig)}`,
    );
  }
  if (!/new\.updated_at=now\(\);returnnew;/.test(normalize(timestamp.prosrc))) {
    fail("trigger_set_timestamp body does not maintain updated_at");
  }

  const rls = functions.get("rls_auto_enable");
  if (!rls) fail("missing function public.rls_auto_enable()");
  assertEqual(rls.result, "event_trigger", "rls_auto_enable return type");
  assertEqual(rls.language, "plpgsql", "rls_auto_enable language");
  assertEqual(rls.prosecdef, false, "rls_auto_enable security mode");
  assertEqual(rls.proconfig, null, "rls_auto_enable function configuration");
  const normalizedSource = normalize(rls.prosrc);
  if (
    !normalizedSource.includes("pg_event_trigger_ddl_commands()") ||
    !normalizedSource.includes("altertableifexists%senablerowlevelsecurity")
  ) {
    fail("rls_auto_enable body differs from the baseline implementation");
  }
}

async function verifyExtensions(knex) {
  const { rows } = await knex.raw(
    `SELECT extension.extname, extension.extversion, schema.nspname AS schema_name
       FROM pg_extension extension
       JOIN pg_namespace schema ON schema.oid = extension.extnamespace
      WHERE extension.extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements')
      ORDER BY extension.extname`,
  );
  const expected = new Map([
    ["uuid-ossp", "1.1"],
    ["pgcrypto", "1.3"],
    ["pg_stat_statements", "1.11"],
  ]);
  assertEqual(rows.length, expected.size, "required extension count");
  for (const row of rows) {
    assertEqual(
      row.extversion,
      expected.get(row.extname),
      `version of extension ${row.extname}`,
    );
    if (!["public", "extensions"].includes(row.schema_name)) {
      fail(
        `unexpected schema for extension ${row.extname}: ${row.schema_name}`,
      );
    }
  }
}

async function verifyRls(knex, rlsMode) {
  const { rows } = await knex.raw(
    `SELECT relname, relrowsecurity
       FROM pg_class relation
       JOIN pg_namespace schema ON schema.oid = relation.relnamespace
      WHERE schema.nspname = 'public' AND relname IN ('shops', 'products')
      ORDER BY relname`,
  );
  assertEqual(rows.length, 2, "shops/products RLS state count");
  const values = new Set(rows.map((row) => row.relrowsecurity));
  if (values.size !== 1)
    fail("shops and products must have the same RLS state");

  const enabled = rows[0].relrowsecurity;
  if (rlsMode === "production" && !enabled) {
    fail("production profile requires RLS enabled on shops and products");
  }
  if (rlsMode === "e2e" && enabled) {
    fail("E2E profile requires RLS disabled on shops and products");
  }
  return enabled ? "enabled" : "disabled";
}

async function verifyBaseline(knex, { rlsMode = "auto" } = {}) {
  if (!RLS_MODES.has(rlsMode))
    fail(`unknown RLS mode ${JSON.stringify(rlsMode)}`);

  const history = await migrationHistory(knex);
  await verifyColumns(knex);
  await verifyConstraints(knex);
  await verifyTriggers(knex);
  await verifyFunctions(knex);
  await verifyExtensions(knex);
  const rls = await verifyRls(knex, rlsMode);
  return { history, rls };
}

async function applyBaseline(knex, { rlsMode }) {
  return knex.transaction(async (trx) => {
    await trx.raw("SELECT pg_advisory_xact_lock(hashtext(?))", [
      ADVISORY_LOCK_KEY,
    ]);
    await trx.raw(
      "LOCK TABLE public.knex_migrations IN SHARE ROW EXCLUSIVE MODE",
    );
    const result = await verifyBaseline(trx, { rlsMode });
    if (result.history === "adopted") return { ...result, applied: false };

    await trx("knex_migrations").insert({
      name: BASELINE_MIGRATION,
      batch: 1,
      migration_time: new Date(),
    });
    return { ...result, applied: true };
  });
}

function parseArguments(argv) {
  let apply = false;
  let rlsMode = "auto";

  for (const arg of argv) {
    if (arg === "--apply") {
      apply = true;
    } else if (arg.startsWith("--rls=")) {
      rlsMode = arg.slice("--rls=".length);
    } else if (arg === "--help") {
      return { help: true };
    } else {
      fail(`unknown argument ${JSON.stringify(arg)}`);
    }
  }

  if (!RLS_MODES.has(rlsMode))
    fail(`unknown RLS mode ${JSON.stringify(rlsMode)}`);
  if (apply && rlsMode === "auto") {
    fail("--apply requires --rls=production or --rls=e2e");
  }
  return { apply, rlsMode, help: false };
}

async function main(argv = process.argv.slice(2), environment = process.env) {
  const options = parseArguments(argv);
  if (options.help) {
    console.log(
      "Usage: node scripts/adopt-baseline.js [--apply --rls=production|e2e] [--rls=auto|production|e2e]",
    );
    return;
  }
  if (!environment.PG_CONNECTION_STRING) {
    fail("PG_CONNECTION_STRING is required");
  }

  const knex = knexFactory({
    client: "pg",
    connection: environment.PG_CONNECTION_STRING,
  });
  try {
    const result = options.apply
      ? await applyBaseline(knex, options)
      : await verifyBaseline(knex, options);
    const action = options.apply
      ? result.applied
        ? "Baseline metadata recorded. No migrations were applied."
        : "Baseline was already recorded. No changes were made."
      : "Dry run succeeded. No changes were made.";
    console.log(`${action} RLS: ${result.rls}. History: ${result.history}.`);
  } finally {
    await knex.destroy();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  BASELINE_MIGRATION,
  applyBaseline,
  hasApprovedTimestampFunctionConfig,
  parseArguments,
  verifyBaseline,
};
