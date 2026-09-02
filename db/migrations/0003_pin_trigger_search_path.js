// 0003_pin_trigger_search_path.js
// Pins the search_path used by public.trigger_set_timestamp() so trigger
// executions cannot resolve relations/functions through a caller-controlled
// search_path. Supabase Security Advisor reports this function with a "role
// mutable search_path"; the approved fix (issue #134) is:
//
//   ALTER FUNCTION public.trigger_set_timestamp()
//   SET search_path = pg_catalog, public;
//
// The pinned representation (proconfig = {search_path=pg_catalog, public}) is
// one of the approved fingerprints in scripts/adopt-baseline.ts and is asserted
// by the database contract tests. Verify with:
//
//   SELECT p.oid::regprocedure AS function_name, p.proconfig
//     FROM pg_proc p
//    WHERE p.oid = 'public.trigger_set_timestamp()'::regprocedure;
//
// RLS on shops/products stays intentionally enabled without policies (all
// browser requests go through server-side APIs with PG_CONNECTION_STRING).
// See docs/database-schema.md.
const SQL_UP = `
ALTER FUNCTION public.trigger_set_timestamp()
SET search_path = pg_catalog, public;
`;

const SQL_DOWN = `
ALTER FUNCTION public.trigger_set_timestamp()
RESET search_path;
`;

/** @param {import("knex").Knex} knex */
exports.up = (knex) => knex.raw(SQL_UP);

/** @param {import("knex").Knex} knex */
exports.down = (knex) => knex.raw(SQL_DOWN);
