# Production database deploy playbook

This playbook is the canonical runbook for shipping **versioned database
changes** to the production PostgreSQL (Supabase) with the Drizzle migration
stack. It covers the one-time guarded baseline adoption (issue #131, replacing
the #130 Knex adoption) and every forward migration that follows it.

Follow it on **every deploy that contains new migrations**. When future deploy
automation (#231) lands, it must reproduce these exact steps and guards.

> Production currently has **no migration history** (`drizzle.__drizzle_migrations`
> does not exist) and none of the repo's migrations were ever applied there —
> verified against Supabase 2026-09-02. The tables/objects already exist, so
> `pnpm run db:migrate` must never run against production before the guarded
> adoption has recorded the baseline (it would try to re-create objects).
> Run section [1. Baseline adoption](#1-baseline-adoption-one-time-only) first.

---

## 0. Preflight

1. Confirm the deploy includes schema changes:

   ```bash
   git ls-tree --name-only origin/master db/drizzle/
   ```

   A deploy that only changes app code does not need this playbook.
2. Open an approved maintenance window with a **verified backup** of the
   production database. Never skip the backup.
3. Confirm no other deployment or manual migration session is running
   concurrently.
4. Prepare the production `PG_CONNECTION_STRING` in the shell environment.
   Never print or commit its value.
5. Install frozen dependencies:

   ```bash
   pnpm install --frozen-lockfile
   ```

## 1. Baseline adoption (one-time only)

Run **only while** production has no Drizzle history (absent or empty
`drizzle.__drizzle_migrations`). After this succeeds once, never run it again.

1. Dry run (no changes):

   ```bash
   PG_CONNECTION_STRING="$PG_CONNECTION_STRING" \
     node scripts/adopt-baseline.ts --rls=production
   ```

   The tool verifies tables, columns, defaults, constraints, triggers,
   baseline functions, extension versions, RLS profile, and migration history.
2. **If it reports drift**: stop. Capture the reported catalog difference and
   ship a forward corrective migration. Do not edit `0000_init.sql` and do not
   force the adoption record.
3. Apply (records exactly `0000_init`; never executes it and never applies
   later migrations):

   ```bash
   PG_CONNECTION_STRING="$PG_CONNECTION_STRING" \
     node scripts/adopt-baseline.ts --apply --rls=production
   ```

4. Re-run the dry run from step 1. It must report `History: adopted` and no
   change.

## 2. Apply pending migrations

After the baseline is recorded (or on every later deploy), apply pending
migrations:

```bash
pnpm run db:migrate
```

This applies, in order, the migrations that are not yet recorded:

| Migration | Change | Issue |
| --- | --- | --- |
| `0000_init.sql` | Schema baseline + extensions (recorded by adoption, not executed here) | #131 / #130 |
| `0001_catalog_indexes.sql` | Secondary indexes: `products(shopid, itemnumber)`, partial catalog `shops(category, updated_at DESC) WHERE visibility='public'`, `shops(typeformtoken)` | #130 / #222 |
| `0002_database_objects.sql` | Functions and triggers (idempotent; converges with the objects production already has) | #130 |
| `0003_pin_search_path.sql` | Pin `trigger_set_timestamp()` to `search_path = pg_catalog, public` | #134 |

> Keep this table updated whenever a new migration is added — it is the place
> that tracks "the things we keep changing".

## 3. Verification

```bash
# Migration history is complete
pnpm run db:migrate:status

# 0001: indexes exist
psql "$PG_CONNECTION_STRING" -c "SELECT indexname FROM pg_indexes WHERE schemaname='public' AND indexname IN ('idx_products_shopid_itemnumber','idx_shops_public_category_updated_at','idx_shops_typeformtoken') ORDER BY indexname;"

# 0003: trigger function search_path is pinned
psql "$PG_CONNECTION_STRING" -c "SELECT p.oid::regprocedure AS function_name, p.proconfig FROM pg_proc p WHERE p.oid = 'public.trigger_set_timestamp()'::regprocedure;"
# expected proconfig: {search_path=pg_catalog, public}

# Guarded adoption dry run is idempotent
PG_CONNECTION_STRING="$PG_CONNECTION_STRING" \
  node scripts/adopt-baseline.ts --rls=production
```

Optionally smoke-test that the shop queries now use the new index.
The structured harness `pnpm run db:explain` runs `EXPLAIN (ANALYZE, BUFFERS)`
on the three hot reads (catalog by category, public shop by slug with
products, editor lookup by token), prints each plan, and asserts the
secondary index added by `0001_catalog_indexes.sql` is referenced.
Run it whenever reviewing index drift.

## 4. Rollback and drift rules

- `0000_init.sql` is **not reversible**. Never roll back past it.
- Migrations are **forward-only**: Drizzle has no down migrations. Prefer a
  **forward corrective migration** over any rollback in production.
- The disposable-database contract tests (`pnpm run test:db`) assert migration
  idempotency, index definitions, the pinned trigger configuration, and the
  guarded adoption flow. Run them before any deploy that touches
  `db/schema.ts`, `db/drizzle/`, `scripts/adopt-baseline.ts`, or `tests/db/`.
- If a live schema differs from the adoption fingerprint or this document,
  stop and reconcile with an explicit, reviewed forward migration.
- RLS stays enabled on production (`shops`/`products` have no policies;
  browser requests go through server-side APIs). E2E deliberately disables
  RLS — never treat E2E parity as a signal to add policies.

## 5. Environment notes

- Migrations and the guarded tooling require Postgres 17.6 and the
  `uuid-ossp`, `pgcrypto`, and `pg_stat_statements` extensions (the last one
  needs `shared_preload_libraries`).
- Automated execution on deploy is tracked in #231; broader deployment,
  rollback, and environment documentation is tracked in #150.
