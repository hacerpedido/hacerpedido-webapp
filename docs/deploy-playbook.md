# Production database deploy playbook

This playbook is the canonical runbook for shipping **versioned database
changes** to the production PostgreSQL (Supabase). It covers the guarded
baseline adoption required by #130 and every migration that follows it
(currently #130/#222 indexes in `0002` and the #134 trigger hardening in
`0003`).

Follow it on **every deploy that contains new migrations**. When a future
deploy automation (#231) lands, it must reproduce these exact steps and guards.

> Production currently has **no Knex migration history** (`knex_migrations`
> does not exist). Until the baseline is adopted once, `pnpm run db:migrate`
> must never be run against production: it would try to re-create objects that
> already exist. Run section [1. Baseline adoption](#1-baseline-adoption-one-time-only)
> first.

---

## 0. Preflight

1. Confirm the deploy includes schema changes:

   ```bash
   git ls-tree --name-only origin/master db/migrations/
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

Run **only while** production has no Knex history (empty or absent
`knex_migrations`). After this succeeds once, never run it again.

1. Dry run (no changes):

   ```bash
   PG_CONNECTION_STRING="$PG_CONNECTION_STRING" \
     node scripts/adopt-baseline.js --rls=production
   ```

   The tool verifies tables, columns, defaults, constraints, triggers,
   baseline functions, extension versions, RLS profile, and migration history.
2. **If it reports drift**: stop. Capture the reported catalog difference and
   ship a forward corrective migration. Do not edit `0001_baseline.js` and do
   not force the adoption record.
3. Apply (records exactly `0001_baseline.js`; never executes it and never
   applies later migrations):

   ```bash
   PG_CONNECTION_STRING="$PG_CONNECTION_STRING" \
     node scripts/adopt-baseline.js --apply --rls=production
   ```

4. Re-run the dry run from step 1. It must report `History: adopted` and no
   change.

## 2. Apply pending migrations

After the baseline is adopted (or on every later deploy), apply pending
migrations:

```bash
pnpm run db:migrate
```

This applies, in order:

| Migration | Change | Issue |
| --- | --- | --- |
| `0001_baseline.js` | Schema baseline (recorded by adoption, not executed here) | #130 |
| `0002_add_secondary_indexes.js` | Secondary indexes: `products(shopid, itemnumber)`, partial catalog `shops(category, updated_at DESC) WHERE visibility='public'`, `shops(typeformtoken)` | #130 / #222 |
| `0003_pin_trigger_search_path.js` | Pin `trigger_set_timestamp()` to `search_path = pg_catalog, public` | #134 |

> Keep this table updated whenever a new migration is added — it is the place
> that tracks "the things we keep changing".

## 3. Verification

```bash
# Migration history is complete
pnpm run db:migrate:status

# 0002: indexes exist
psql "$PG_CONNECTION_STRING" -c "SELECT indexname FROM pg_indexes WHERE schemaname='public' AND indexname IN ('idx_products_shopid_itemnumber','idx_shops_public_category_updated_at','idx_shops_typeformtoken') ORDER BY indexname;"

# 0003: trigger function search_path is pinned
psql "$PG_CONNECTION_STRING" -c "SELECT p.oid::regprocedure AS function_name, p.proconfig FROM pg_proc p WHERE p.oid = 'public.trigger_set_timestamp()'::regprocedure;"
# expected proconfig: {search_path=pg_catalog, public}

# Guarded adoption dry run is idempotent
PG_CONNECTION_STRING="$PG_CONNECTION_STRING" \
  node scripts/adopt-baseline.js --rls=production
```

Optionally smoke-test that the shop queries now use the new index
(`EXPLAIN (ANALYZE, BUFFERS)` on a public shop slug).

## 4. Rollback and drift rules

- `0001_baseline.js` is **not reversible**. Never roll back past it.
- Prefer a **forward corrective migration** over rollbacks in production.
- Reversible migrations are validated in CI/disposable databases with targeted
  `migrate:up <file>` / `migrate:down <file>`; never use batch rollback on a
  fresh database, because the irreversible baseline can share the same batch.
- If a live schema differs from the adoption fingerprint or this document,
  stop and reconcile with an explicit, reviewed forward migration.
- RLS stays enabled on production (`shops`/`products` have no policies;
  browser requests go through server-side APIs). E2E deliberately disables
  RLS — never treat E2E parity as a signal to add policies.

## 5. Environment notes

- Migrations and the guarded tooling require Postgres 17.6 and the
  `uuid-ossp`, `pgcrypto`, and `pg_stat_statements` extensions (the last one
  needs `shared_preload_libraries`).
- The database contract tests (`pnpm run test:db` against disposable
  PostgreSQL) assert migration idempotency, index definitions, the adoption
  flow, and the pinned trigger configuration. Run them before any deploy that
  touches `db/migrations/`, `scripts/adopt-baseline.js`, or `tests/db/`.
- Automated execution on deploy is tracked in #231; broader deployment,
  rollback, and environment documentation is tracked in #150.
