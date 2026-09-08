---
name: drizzle-migrations
description: Create, apply and seed Drizzle migrations for HacerPedido (shops/products schema on PostgreSQL). Use when working with migrations, db:migrate, db:migrate:make, db:seed:e2e, schema changes, adding columns or tables, or anything touching the database schema.
---

# Drizzle migrations

The project uses Drizzle over `pg` with PostgreSQL 17.6. The TypeScript schema
in `db/schema.ts` is the authority for tables/indexes; versioned SQL
migrations live in `db/drizzle/`. Never alter the schema by hand.

## When to use

- Creating or editing migrations (`db/schema.ts` + `db/drizzle/`)
- Applying migrations (`pnpm run db:migrate`, `db:migrate:status`)
- Seeding databases (`pnpm run db:seed`, `db:seed:test`, `db:seed:e2e`)
- Any task named after `db:` or touching the `shops` / `products` schema

## Commands

| Command | What it does |
|---|---|
| `pnpm exec drizzle-kit generate --name <name>` | New migration from `db/schema.ts` changes |
| `pnpm exec drizzle-kit generate --custom --name <name>` | New hand-written SQL migration |
| `pnpm run db:migrate` | Apply pending migrations (forward-only) |
| `pnpm run db:migrate:status` | List applied/pending migrations |
| `pnpm run db:seed` / `db:seed:test` / `db:seed:e2e` | Seeds (`scripts/db-seed.ts` runner) |
| `node scripts/adopt-baseline.ts --rls=production` | Guarded prod adoption dry run |

## Key facts

- Config: `drizzle.config.ts` — schema `./db/schema.ts`, migrations out
  `./db/drizzle`, bookkeeping in `drizzle.__drizzle_migrations`; it **throws if
  `PG_CONNECTION_STRING` is missing** (loaded from `.env.local` via `@next/env`).
- Baseline: `db/drizzle/0000_init.sql` snapshots the production schema and is
  **not reversible**. Production records it as applied via
  `scripts/adopt-baseline.ts` without executing it; fresh DBs run it normally.
- Tables: `shops` and `products`. Default `id` is `uuid_generate_v1()`
  (resolved via `search_path` — don't qualify it in new migrations).
- Extensions created: `uuid-ossp`, `pgcrypto`, `pg_stat_statements` (the last
  requires `shared_preload_libraries` — see `compose.e2e.yaml`).
- Triggers/functions (`set_timestamp`, `trigger_set_timestamp`,
  `rls_auto_enable`) are custom SQL migrations (Drizzle cannot model them).
- Migrations are forward-only — no down migrations; roll back with a forward
  corrective migration.

## Adding a column (recipe)

1. Edit `db/schema.ts` (e.g. add `newname: text("newname")` to `shops`).
2. `pnpm exec drizzle-kit generate --name add_newname_to_shops`
3. Review the generated SQL under `db/drizzle/`.
4. Apply: `pnpm run db:migrate`
5. Verify against the E2E stack if relevant: `pnpm run test:e2e` (global setup
   runs `db-migrate.ts` + `fixtures/setup.ts` automatically).

For DDL Drizzle cannot generate (functions, triggers, indexes with exotic
options), add a hand-written migration instead:

```bash
pnpm exec drizzle-kit generate --custom --name add_thing
# then edit db/drizzle/<NNNN>_add_thing.sql and apply with pnpm run db:migrate
```

## Gotchas

- **Keep Postgres 17.6 compatibility**: no `pgjwt`, `timescaledb`, `plv8`, or
  platform-only extensions.
- **Baseline is not reversible** — never try to roll back past it; use
  corrective forward migrations.
- **RLS parity**: prod has RLS enabled, E2E DB does not. Don't assume policies
  behave the same in both.
- **Seed data** lives in `db/seeds/dev` and `tests/e2e/fixtures/seeds/` and
  must keep dev and the E2E specs working (e.g. fixture shop uses
  `+5491100000000`).
- Migration changes that alter the persisted cart shape can interact with
  stale localStorage state — consider a reset/version bump when the persisted
  shape changes.

## References

- `references/baseline-schema.md` — full column lists for `shops` and
  `products`.
- `docs/database-schema.md` — canonical schema contract and adoption rules.
- `docs/deploy-playbook.md` — production migration runbook.
- Repo: `AGENTS.md` → repo map + commands; `README.md` → DB section.
