# Database schema and baseline operations

This document is the canonical schema contract for the database state
represented by the Drizzle migrations. The TypeScript schema in
`db/schema.ts` is the single authority for table/column shapes and indexes;
`drizzle-kit` turns it into the versioned SQL migrations under `db/drizzle/`.

## Migration layout

| File | What it contains |
| --- | --- |
| `db/schema.ts` | Typed authority: `shops` and `products` with production constraint names (`shops_slug_key`, `products_shopid_fkey`) and the approved secondary indexes. |
| `db/drizzle/0000_init.sql` | Generated snapshot of the production schema (tables, constraints, defaults) plus the extensions needed by the `uuid_generate_v1()` default. **Not reversible.** |
| `db/drizzle/0001_catalog_indexes.sql` | Generated secondary indexes: `products(shopid, itemnumber)`, partial catalog `shops(category, updated_at DESC) WHERE visibility='public'`, `shops(typeformtoken)`. |
| `db/drizzle/0002_database_objects.sql` | Custom SQL migration: `trigger_set_timestamp()` + `set_timestamp` triggers and `rls_auto_enable()` (objects Drizzle cannot model). Idempotent. |
| `db/drizzle/0003_pin_search_path.sql` | Custom SQL migration pinning `trigger_set_timestamp()` to `search_path = pg_catalog, public` (issue #134). |

Applied migrations are recorded in `drizzle.__drizzle_migrations`
(`hash`, `created_at`) — never edit an already-applied migration. Schema
changes ship as a new forward migration:

```bash
# Schema-only change: edit db/schema.ts, then
pnpm exec drizzle-kit generate --name=<what_changes>

# Hand-written SQL (functions, triggers, extensions, data fixes):
pnpm exec drizzle-kit generate --custom --name=<what_changes>
```

## Guarded baseline adoption

Production (and any pre-existing database) already has the objects that
`0000_init` describes — running it there would fail or duplicate DDL.
`scripts/adopt-baseline.ts` therefore verifies the live catalog against the
baseline fingerprint (columns, constraints, triggers, functions, extension
versions, RLS profile) and only then **records** `0000_init` as applied,
without executing it:

```bash
# Dry run (read-only fingerprint + history check):
node scripts/adopt-baseline.ts --rls=production

# After the dry run reports a clean fingerprint, record the baseline:
node scripts/adopt-baseline.ts --apply --rls=production
```

Fresh databases (dev, E2E, CI) never run adoption: `pnpm run db:migrate`
applies the full set from an empty history.

## Authoring rules

- The baseline `0000_init.sql` is **not reversible** and is never edited after
  adoption. If the live schema drifts from this document or the fingerprint,
  stop and ship a forward corrective migration.
- Migrations are forward-only: rollbacks are written as forward corrective
  migrations (Drizzle has no down migrations).
- Drizzle cannot model functions, triggers, extensions, RLS or search_path
  pinning — keep those in `--custom` SQL migrations under `db/drizzle/` and
  update this document when they change.
- Keep `db/schema.ts` and `docs/database-schema.md` in sync.

## Verification

- `pnpm run db:migrate:status` — applied vs pending migrations.
- `pnpm run test:db` — disposable PostgreSQL contract suite (migration
  idempotency, indexes, pinned trigger config, UUID/opaque price and FK
  contracts, and the guarded adoption flow). Run before any deploy that
  touches `db/schema.ts`, `db/drizzle/`, `scripts/adopt-baseline.ts`, or
  `tests/db/`.
- RLS stays enabled on production (`shops`/`products` have no policies;
  browser requests go through server-side APIs). E2E deliberately disables
  RLS — never treat E2E parity as a signal to add policies.
