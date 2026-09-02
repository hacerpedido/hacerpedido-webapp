# Database schema and baseline operations

This document is the canonical schema contract for the database state represented
by `db/migrations/0001_baseline.js`. It is intentionally separate from future
schema work: do not edit that migration after it has been adopted.

## Compatibility and ownership

- Database: PostgreSQL 17.6.
- Schema changes are versioned Knex migrations in `db/migrations/`.
- The repository's production schema predates Knex migration tracking. Its
  baseline must be adopted before any pending migration is applied; see
  [Baseline adoption](#baseline-adoption).
- E2E uses a disposable PostgreSQL 17.6 Docker volume. It is not production and
  may be deleted by the test harness.
- `pgjwt`, `timescaledb`, and `plv8` are not supported.

## Canonical tables

### `public.shops`

| Contract | Value |
| --- | --- |
| Primary key | `id uuid`, default `uuid_generate_v1()` |
| Required fields | `name text`, `slug text`, `region text` |
| Uniqueness | `slug` |
| Timestamps | nullable `created_at` and `updated_at`, both default `now()` |
| Mutable timestamp | `set_timestamp` invokes `public.trigger_set_timestamp()` before every update |

The remaining shop fields are nullable `text` values: `username`, `category`,
`address`, `notes`, `ordersbyphoneorwhatsapp`, `delivery`, `takeaway`,
`whatsappnumber`, `phonenumber`, `email`, `submittedat`, `opentimes`,
`deliverycost`, `visibility`, `logo`, `background`, `typeformtoken`,
`ordersphonenumber`, and `orderswhatsappnumber`.

### `public.products`

| Contract | Value |
| --- | --- |
| Primary key | `id uuid`, default `uuid_generate_v1()` |
| Required fields | `category text`, `name text`, `shopid uuid` |
| Parent relationship | `shopid` references `shops.id` |
| Delete/update behavior | PostgreSQL `NO ACTION`; a shop with products cannot be deleted or have its ID updated |
| Optional fields | `description text`, `price text`, `itemnumber integer` |
| Timestamps | nullable `created_at` and `updated_at`, both default `now()` and trigger-maintained |

`products.price` is opaque display text. It is not a numeric, decimal, or money
contract. Preserve its exact string on reads and writes until a separately
approved price-model migration is designed.

## Identifier and relationship contracts

- PostgreSQL UUID values are returned by `pg` as strings. Application and API
  boundaries must treat `shops.id`, `products.id`, and `products.shopid` as
  opaque UUID strings, never numbers.
- The current product foreign key intentionally does **not** cascade. Seed and
  maintenance code must delete product rows before their parent shop rows.
- Future order/customer migrations must preserve historical snapshots. In
  particular, do not choose cascading shop/product deletes merely to simplify
  cleanup.

## Functions, triggers, extensions, and RLS

The baseline requires these extensions at their PostgreSQL 17.6 versions:

- `uuid-ossp` 1.1
- `pgcrypto` 1.3
- `pg_stat_statements` 1.11

Local Compose preloads `pg_stat_statements`. Extension objects may live in
`public` in the local E2E database or in Supabase's `extensions` schema in
production; UUID defaults are intentionally invoked without a schema qualifier.

The baseline contains:

- `public.trigger_set_timestamp()`, used by `set_timestamp` triggers on both
  tables;
- `public.rls_auto_enable()`, which matches production's event-trigger
  function.

`db/migrations/0002_pin_trigger_search_path.js` pins the function
`search_path` of `public.trigger_set_timestamp()` to `pg_catalog, public`
with `ALTER FUNCTION ... SET search_path`. This resolves the Supabase Security
Advisor "role mutable search_path" finding for trigger functions and is
reversible with `RESET search_path`. The pinned `proconfig` value
(`search_path=pg_catalog, public`) is one of the approved function
configurations checked by `scripts/adopt-baseline.js`.

Production has RLS enabled on `shops` and `products`. E2E deliberately does
not create the Supabase event trigger and leaves RLS disabled because its
non-superuser test role has no policies. This is an intentional environment
difference, not a signal to add public RLS policies. Direct browser access is
not part of the current architecture; the Security Advisor "RLS enabled without
policies" report on `shops`/`products` is the same intentional posture and must
not be silenced with permissive public policies.

## Index policy

The baseline has only implicit primary-key indexes and the unique index on
`shops.slug`. Do not add secondary indexes based on assumptions. In particular,
`products.shopid`, public catalog filtering, and editor-token lookup need real
`EXPLAIN (ANALYZE, BUFFERS)` evidence using representative cardinality before a
dedicated index migration is proposed.

## Baseline adoption

`0001_baseline.js` creates the schema on an empty local database but was never
run in production. The production `knex_migrations` table is expected to be
empty before adoption. Running `pnpm run db:migrate` first would attempt to
create already-existing objects and is unsafe.

The guarded tool is `scripts/adopt-baseline.js`:

- It defaults to dry-run and never calls Knex's migration APIs.
- It verifies the complete tracked `shops`/`products` column contract,
  defaults, constraints, triggers, baseline functions, extension versions, RLS
  profile, and migration history.
- `trigger_set_timestamp()` may have either its original `NULL` function
  configuration or exactly the search path configuration introduced separately
  by #134: `search_path=pg_catalog, public`. Any other function configuration
  is drift.
- It accepts an empty history or any history whose first recorded migration is
  `0001_baseline.js` (an adopted baseline followed by versioned forward
  migrations such as `0002_pin_trigger_search_path.js`); anything else fails
  closed as drift.
- Applying acquires a transaction-scoped advisory lock and locks
  `public.knex_migrations` before rechecking the fingerprint.
- Applying writes one metadata row for `0001_baseline.js`; it never runs that
  file or any later migration.

### Production runbook

Do not run this procedure against production without an approved maintenance
window, a verified backup, and a maintainer reviewing the dry-run output.

1. Ensure the target `PG_CONNECTION_STRING` selects the intended production
   database. Do not print or commit its value.
2. Confirm there is no concurrent deployment or manual migration session.
3. Run the production-specific dry run:

   ```bash
   PG_CONNECTION_STRING="$PG_CONNECTION_STRING" node scripts/adopt-baseline.js --rls=production
   ```

4. If it reports drift, stop. Capture the reported catalog difference and
   create a forward corrective migration; do not alter `0001_baseline.js` or
   force an adoption record.
5. With approval, record only the verified baseline:

   ```bash
   PG_CONNECTION_STRING="$PG_CONNECTION_STRING" node scripts/adopt-baseline.js --apply --rls=production
   ```

6. Re-run the same dry run. It must report the already-adopted baseline and no
   change.
7. Only after adoption is verified may the normal deployment process use
   `pnpm run db:migrate` for later migrations.

Use `--rls=e2e` only for the disposable E2E database. `--apply` rejects the
ambiguous `auto` RLS mode.

## Disposable database contract tests

The contract test reads `PG_CONNECTION_STRING` directly; it does not start
Docker or derive a connection string. Set it to the disposable E2E PostgreSQL
connection described by `tests/e2e/fixtures/database.ts`, never a development
or production connection. The database-name guard only accepts
`hacerpedido_e2e` or `hacerpedido_db_contracts`.

It starts from an empty volume, applies the baseline, checks that a second
`migrate:latest` is idempotent, then checks UUID/string serialization, opaque
text prices, orphan rejection, parent-delete rejection, and guarded baseline
adoption.

```bash
docker compose --project-name hacerpedido-e2e -f compose.e2e.yaml down --volumes --remove-orphans
docker compose --project-name hacerpedido-e2e -f compose.e2e.yaml up --detach --wait
# PG_CONNECTION_STRING must already target the disposable E2E PostgreSQL database.
pnpm run test:db
docker compose --project-name hacerpedido-e2e -f compose.e2e.yaml down --volumes --remove-orphans
```

The first and last commands delete the E2E volume. They must never be pointed
at development or production data. `pnpm run test:e2e` separately exercises the
same migration path together with browser flows.

The disposable database contract tests apply `0001_baseline.js` and
`0002_pin_trigger_search_path.js` together, then assert the function's
`proconfig` is exactly `search_path=pg_catalog, public`, so the integration
path exercises the hardened #134 representation. `tests/db/adopt-baseline.test.js`
keeps the unit contract for accepted function configurations (the original
`NULL` or the pinned #134 value) and rejects any other setting.

## Rollback and drift rules

- `0001_baseline.js` is intentionally irreversible. Never roll back past it.
- For production data, prefer a forward corrective migration over rollback.
- A reversible future migration must be tested with targeted `migrate:up` and
  `migrate:down`; do not use batch rollback on a fresh database, because the
  irreversible baseline can share that batch.
- When a live schema differs from this document or the adoption fingerprint,
  stop and reconcile it with an explicit, reviewed forward migration.
