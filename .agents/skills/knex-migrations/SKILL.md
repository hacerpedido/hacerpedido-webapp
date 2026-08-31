---
name: knex-migrations
description: Create, apply, roll back and seed Knex migrations for HacerPedido (shops/products schema on PostgreSQL). Use when working with migrations, db:migrate, db:migrate:make, db:rollback, db:seed:e2e, schema changes, adding columns or tables, or anything touching the database schema.
---

# Knex migrations

The project uses Knex with PostgreSQL 17.6. All DB work goes through migrations; never alter the schema by hand.

## When to use

- Creating or editing migrations (`db/migrations/`)
- Applying / rolling back (`npm run db:migrate`, `npm run db:rollback`)
- Seeding the E2E database (`npm run db:seed:e2e`)
- Any task named after `db:` or touching `shops` / `products` schema

## Commands

| Command | What it does |
|---|---|
| `npm run db:migrate:make <name>` | Create a new migration file |
| `npm run db:migrate` | Apply pending migrations (`migrate:latest`) |
| `npm run db:rollback` | Roll back the last batch |
| `npm run db:seed:e2e` | Run seeds (`tests/e2e/fixtures/seeds`) |

## Key facts

- Config: `knexfile.js` — client `pg`, migrations in `./db/migrations`, seeds in `./tests/e2e/fixtures/seeds`, and it **throws if `PG_CONNECTION_STRING` is missing** (loaded from `.env.local` via `@next/env`).
- Single baseline: `db/migrations/0001_baseline.js` creates the whole schema and **is not reversible** (`exports.down` throws).
- Tables: `shops` and `products`. Default `id` is `uuid_generate_v1()` (resolved via `search_path` to the `extensions` schema — don't qualify it in new migrations).
- Extensions created: `uuid-ossp`, `pgcrypto`, `pg_stat_statements` (the last requires `shared_preload_libraries` — see `compose.e2e.yaml`).
- Triggers: `set_timestamp` on both tables call `trigger_set_timestamp()` to maintain `updated_at`.
- `rls_auto_enable()` is replicated from prod but the Supabase event trigger is NOT created here (E2E role is not superuser; RLS is disabled on the E2E DB).

## Adding a column (recipe)

1. `npm run db:migrate:make add_<column>_to_shops`
2. Edit the new file in `db/migrations/` with `exports.up` / `exports.down`:

```js
exports.up = (knex) =>
  knex.schema.alterTable("shops", (table) => {
    table.text("newname").nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable("shops", (table) => {
    table.dropColumn("newname");
  });
```

3. Apply: `npm run db:migrate`
4. Verify against the E2E stack if relevant: `npm run test:e2e` (global-setup runs `migrate:latest` + `seed:run` automatically).

## Gotchas

- **Keep Postgres 17.6 compatibility**: no `pgjwt`, `timescaledb`, `plv8`, or platform-only extensions.
- **Baseline is not reversible** — never try to roll back past it; use corrective forward migrations.
- **RLS parity**: prod has RLS enabled, E2E DB does not. Don't assume policies behave the same in both.
- **Seed data** lives in `tests/e2e/fixtures/seeds/` and must keep the E2E specs working (e.g. fixture shop uses `+5491100000000`).
- Migration changes that alter what the app writes into Redux state can interact with `redux-persist` and stale persisted state — consider a reset/version bump when the persisted shape changes.

## References

- `references/baseline-schema.md` — full column lists for `shops` and `products`.
- Repo: `AGENTS.md` → repo map + commands; `README.md` → DB section.