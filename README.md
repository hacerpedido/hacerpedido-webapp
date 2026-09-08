# HacerPedido WebApp

[![CI](https://github.com/hacerpedido/hacerpedido-webapp/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/hacerpedido/hacerpedido-webapp/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/hacerpedido/hacerpedido-webapp/branch/master/graph/badge.svg)](https://codecov.io/gh/hacerpedido/hacerpedido-webapp)

HacerPedido is a web application (Next.js + React) that enables local businesses to receive orders through WhatsApp. Customers browse a shop's storefront, build their order in a cart, and send it as a pre-built WhatsApp message without registering.

This repository is the **webapp** (frontend + internal API routes). Browser requests use the native `fetch` API against internal App Router routes backed by PostgreSQL.

| | |
|---|---|
| **Frontend** | Next.js 16.3.4 (App Router), React 19.2.8 |
| **State** | CartContext (useReducer + localStorage) |
| **Data** | PostgreSQL 17.6 (Supabase) via Knex |
| **Orders** | WhatsApp integration (`wa.me` with a pre-built message) |
| **Testing** | Jest (unit) + Playwright (E2E), with migrated tests in TypeScript |
| **Tooling** | TypeScript (`tsconfig.json`) + Biome (format/lint) |
| **CI** | GitHub Actions (lint, unit, E2E) |
| **Project status** | In active development — see open issues |

> Instructions for AI agents: see [AGENTS.md](AGENTS.md).

## Architecture

- The application has been migrated to TypeScript: App Router pages, API routes, and components use `.ts`/`.tsx`; E2E tests also use `.ts`.
- **App Router pages** in `app/`: home (`page.tsx`), public shop (`[slug]/page.tsx`), checkout (`cart/page.tsx` → WhatsApp), and layout/error/loading boundaries.
- **App Router API routes** in `app/api/`: editor, images, home, shop, and token-based management.
- **HTTP request layer**: native `fetch` requests target the internal App Router routes in `app/api/`, whose server-side data access uses PostgreSQL.
- **Styles**: web components use CSS Modules placed alongside the component (`Component.tsx` + `Component.module.css`).

### WhatsApp order flow

1. The customer adds products to the cart on the shop page (`app/[slug]/page.tsx`).
2. In `app/cart/page.tsx`, they complete their name, address, and notes.
3. `generateWhatsappURL(orderswhatsappnumber, formData, productsByCategory)` in `lib/utils/utils.ts` normalizes the number (see `sanitizeWhatsAppNumber`, Argentine rules) and builds `https://wa.me/<número>?text=<mensaje codificado>`.
4. The message includes an introduction, address, notes, and the order grouped by category (`✅ 2 x Ñoquis`).
5. The shop receives the order in its WhatsApp.

## Project structure

```
app/              App Router: public pages, checkout, and API routes
  page.tsx        Home
  [slug]/page.tsx Public shop page
  cart/page.tsx   Checkout → WhatsApp
  [slug]/edit/    Token-based shop management
  api/            editor, images, home, and shop routes
components/       UI (CSS Modules + Bootstrap)
  Home/ Shop/ Cart/ EditShop/   + primitivas (Input, Form, Switch, MessageBox…)
lib/              Application logic
    api/            Native fetch request helpers and server data access (TypeScript)
    context/        CartContext.tsx (cart state with useReducer + localStorage)
    utils/          TypeScript helpers: WhatsApp, phone numbers, prices, products, categories, S3
    hooks/          use_width
db/               Knex migrations (shops/products baseline)
tests/            Unit (Jest, alongside the code) and E2E (Playwright)
assets/ public/   Colors/theme/backgrounds; manifest, favicons, OG image
docs/             Documentation
```

## Getting started

### Requirements

- Node.js 22 (CI and `.tool-versions` use 22)
- pnpm 11.25.0
- **Docker** (for the local database, S3-compatible image storage, and E2E; starts PostgreSQL 17.6 with `pg_stat_statements`)

### Environment variables

Copy `.env.example` to `.env.local` (or create it) in the repository root. For local development,
the example's database and S3 values work with `compose.dev.yaml`:

| Variable | Purpose | Required? |
|---|---|---|
| `PG_CONNECTION_STRING` | PostgreSQL connection (Knex, migrations, E2E override) | Yes (db) |
| `HP_S3_ENDPOINT` | Local S3-compatible endpoint (`http://localhost:7070`) | Images only |
| `HP_AWS_ACCESS_KEY_ID` | Local S3 image-upload access key | Uploads only |
| `HP_AWS_SECRET_ACCESS_KEY` | Local S3 image-upload secret | Uploads only |
| `HP_AWS_IMAGES_BUCKET` | Local S3 image bucket | Uploads only |
| `NEXT_PUBLIC_IMAGE_BUCKET_URL` | Local public bucket URL | Images only |
| `DEV_S3_PORT` | Local S3 host port (default `7070`) | No |
| `DEV_S3_ACCESS_KEY` / `DEV_S3_SECRET_KEY` | Credentials used by the local Compose S3 service | No |
| `DEV_S3_BUCKET` | Bucket created by the local S3 init service | No |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | Error monitoring (disabled in dev) | No |
| `SENTRY_AUTH_TOKEN` | Sentry source map upload (CI/deploy) | Uploads only |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Sentry org/project slugs (default from `sentry.properties`) | Uploads only |

> Never commit secret values. `Sentry` is automatically disabled in development.

The development Compose stack runs VersityGW, an S3-compatible local service, on
`http://localhost:7070` with the non-sensitive credentials from `.env.example`.
It creates `hacerpedido-images` automatically; no external AWS account or cloud
credentials are needed. If you change `DEV_S3_PORT` or `DEV_S3_BUCKET`, update
`HP_S3_ENDPOINT`, `HP_AWS_IMAGES_BUCKET`, and `NEXT_PUBLIC_IMAGE_BUCKET_URL` to
match. Keep the `DEV_S3_*` values and the `HP_AWS_*` credentials aligned.

Production and preview deployments use the real `HP_AWS_ACCESS_KEY_ID`,
`HP_AWS_SECRET_ACCESS_KEY`, `HP_AWS_IMAGES_BUCKET`, and
`NEXT_PUBLIC_IMAGE_BUCKET_URL` values configured in Vercel. `HP_S3_ENDPOINT` is
only for local S3-compatible storage and should not point production at localhost.

Sentry follows the SDK v10 wiring: `next.config.ts` wraps the Next config with
`withSentryConfig`, `instrumentation.ts` + `instrumentation-client.ts` initialize
the server/edge/client SDKs, and `app/error.tsx` / `app/global-error.tsx` report
React render errors. Source maps upload when `SENTRY_AUTH_TOKEN` is set; without a
token the build skips the upload with a warning instead of failing.

### Installation and development

```bash
pnpm install
pnpm run db:setup   # Docker + migrations + development data
pnpm run dev        # http://localhost:3000
```

`pnpm dev` checks that Docker is available, starts the local Compose services with
`pnpm run db:up`, runs the unit and E2E suites, and then starts Next.js. On macOS,
if Docker is unavailable and Colima is installed, it starts Colima first. If Docker
cannot be made available, start Docker Desktop (or run `colima start` on macOS) and
retry `pnpm dev`.

The startup check runs only when `pnpm dev` is invoked; it does not configure any
services to start at login or globally. Run `pnpm run db:setup` first when setting
up a new development database; subsequent `pnpm dev` runs ensure the services are
up and run the test suites before starting Next.js.

Test commands never start Colima. Their preflight first verifies Docker, local
PostgreSQL, and VersityGW; if anything is unavailable, start Docker (or run
`colima start` on macOS), then run `pnpm run db:up` and retry the test command.
The E2E setup may then start its separate test Compose stack.

`pnpm-lock.yaml` is the project's canonical lockfile; use pnpm to install
dependencies and run the scripts.

### Database

```bash
pnpm run db:migrate       # Apply Drizzle migrations (forward-only)
pnpm run db:migrate:make -- migration_name # Create a new migration
pnpm run db:migrate:status # Show migration status
pnpm run db:rollback      # Revert the last migration
pnpm run db:create         # Create/start the local database (idempotent)
pnpm run db:seed           # Start PostgreSQL and load synthetic data
pnpm run db:seed:test      # E2E fixtures (test database)
pnpm run db:up              # Start PostgreSQL and local S3 on 54328/7070
pnpm run db:down            # Stop local PostgreSQL and S3
pnpm run db:logs           # Follow PostgreSQL logs
pnpm run db:check          # Check that PostgreSQL responds
pnpm run db:reset          # Delete the local volume and recreate everything
```

The development database uses `compose.dev.yaml` and port **54328**. The E2E database
uses `compose.e2e.yaml`, port **54329**, and deterministic fixtures; they are separate
databases. `db:reset` permanently deletes data from the local volume:
use it only when you want to start from scratch. It does not require `psql` to be installed on the
host; checks run inside the container.

`db:up` starts PostgreSQL and the local VersityGW service, waits for their health
checks, and prepares the image bucket idempotently. `db:down` stops the services
but keeps the named PostgreSQL, S3 data, and S3 IAM volumes, so local images and bucket state persist across
restarts. To inspect S3 logs, run `docker compose -f compose.dev.yaml logs -f s3`.
Use `db:reset` when you intentionally want to delete all local database and S3
data and recreate the stack.

Baseline `0000_init` creates `shops` and `products` and is **not reversible** (forward-only migrations). It requires the `uuid-ossp`, `pgcrypto`, and `pg_stat_statements` extensions (the latter must be preloaded — see `compose.e2e.yaml`). Compatible with Postgres 17.6.

### Worktrees and concurrent stacks

Both Compose stacks support running from Git worktrees without colliding with the
main checkout or with each other:

- **E2E**: when the current checkout is a worktree lane (a path under
  `.slim/worktrees/<lane>` or any `worktrees/` directory), `pnpm run test:e2e`
  automatically derives its own Compose project, PostgreSQL port, app port,
  database volume, and Playwright artifact directories from the checkout path.
  The main checkout keeps the documented defaults (`hacerpedido-e2e`, port
  `54329`, app port `3001`, `test-results/` and `playwright-report/`).
- **Dev database**: `db:*` commands keep using the implicit Compose project of the
  checkout directory, so containers from different worktrees never clash. For a
  second dev database on another port, set `DEV_PG_PORT` (default `54328`) and
  optionally `DEV_VOLUME_PREFIX` to give it a separate volume; point
  `PG_CONNECTION_STRING` at the port you use.

Run `pnpm run test:e2e:info` in any checkout to print the resolved context.
Explicit overrides (`E2E_RUN_ID`, `E2E_PROJECT_NAME`, `E2E_PG_PORT`,
`E2E_APP_PORT`, `E2E_VOLUME_PREFIX`) always win over the derived values.

> Never run two E2E suites from the same checkout at the same time: each run
> tears down its own Compose stack and database at start and finish.

## Testing

### Unit (Jest)

```bash
pnpm test
```

Tests alongside the code: `lib/utils/*.test.js`, `lib/context/CartContext.test.jsx`, and
component tests in `components/**/*.test.jsx`.

### E2E (Playwright)

```bash
pnpm run test:e2e
```

Automatically starts (via `global-setup`) the Docker Compose stack with PostgreSQL 17.6, applies migrations + seed, builds and serves the app, and runs the journeys in Chromium:

- `tests/e2e/order-flow.spec.ts` — order flow that intercepts `wa.me` and validates the message
- `tests/e2e/cart-persistence.spec.ts`, `cart-interactions.spec.ts` — cart persistence and controls
- `tests/e2e/cart-validation.spec.ts` — checkout validation
- `tests/e2e/public-pages.spec.ts`, `public-routing-seo.spec.ts` — public routes and SEO metadata
- `tests/e2e/admin-flow.spec.ts` — App Router token-based shop management

Useful overrides: `PLAYWRIGHT_TEST_BASE_URL` (already-deployed app, skips local setup) and `PG_CONNECTION_STRING` (external database instead of the local Compose stack). Run `pnpm run test:e2e:info` to see the resolved run context (Compose project, ports, artifact paths) for the current checkout; see [Worktrees and concurrent stacks](#worktrees-and-concurrent-stacks).

First time: `pnpm run test:e2e:install` (installs Chromium).

## CI

`.github/workflows/ci.yml` runs on every push and pull request: installs with pnpm using the frozen lockfile, runs quality checks and E2E tests in separate jobs, and uploads the Playwright report if a job fails.

## Available scripts

| Script | Description |
|---|---|
| `pnpm run dev` | Ensure local Docker services are up, then start the dev server (port 3000; `PORT=3001 pnpm run dev` for another port) |
| `pnpm run build` | Production build |
| `pnpm run start` | Serve the production build |
| `pnpm test` | Check local services, then run unit tests (Jest) |
| `pnpm run test:e2e` | Check local services, then run E2E (Playwright + Docker) |
| `pnpm run test:e2e:install` | Install Chromium |
| `pnpm run lint` | Biome lint |
| `pnpm run db:migrate` / `db:migrate:make` / `db:migrate:status` / `db:rollback` | Knex migrations |
| `pnpm run db:seed` | Development seed |
| `pnpm run db:seed:test` / `db:seed:e2e` | E2E seed |
| `pnpm run db:create` / `db:up` / `db:down` / `db:logs` / `db:check` | Operate local PostgreSQL and S3 |
| `pnpm run db:setup` / `db:reset` | Set up / recreate the local DB |
| `pnpm run format` | Format code with Biome |
| `pnpm run format:check` | Check formatting with Biome |
| `pnpm run typecheck` | Check types with TypeScript |
| `pnpm run check` | Check formatting, lint, and imports with Biome |

## Deploy

Deploy to Vercel: configure the environment variables listed above (Sentry is enabled in production). No public deployment URLs are documented in this repository.

## Troubleshooting

- **Node.js**: use Node 22, as declared by `.tool-versions` and the CI workflow.
- **`pnpm run test:e2e` fails in global-setup**: Docker must be running (the setup runs `docker compose down --volumes && up --detach --wait` before migrating/seeding). A busy host port is reported by Docker — each worktree derives its own port, and you can force another with `E2E_PG_PORT`/`E2E_APP_PORT` (see `tests/e2e/fixtures/database.ts` and `compose.e2e.yaml`).
- **Local PostgreSQL**: `pg_stat_statements` must be in `shared_preload_libraries` (as in `compose.e2e.yaml`).

## Contributing

- Commits in [Conventional Commits](https://www.conventionalcommits.org/) format.
- Run `pnpm run lint` and `pnpm test` before opening a PR (E2E when touching flows).
- For each visual component, place styles in a `*.module.css` file alongside the component and import them as `styles`.
- Use semantic kebab-free camelCase class names (`containerLogo`, `shopName`) and apply them with `className={styles.nombre}`.
- Prefer CSS variables for values that change from React and keep visual states (`:hover`, `:focus`) in the module.
- AI agents: read [AGENTS.md](AGENTS.md) and use the skills in `.agents/skills/` when applicable.
