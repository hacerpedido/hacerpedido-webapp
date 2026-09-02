# HacerPedido WebApp

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
- **Docker** (for the local database and E2E; starts PostgreSQL 17.6 with `pg_stat_statements`)

### Environment variables

Copy `.env.example` to `.env.local` (or create it) in the repository root. For local development,
the example's `PG_CONNECTION_STRING` value works with `compose.dev.yaml`:

| Variable | Purpose | Required? |
|---|---|---|
| `PG_CONNECTION_STRING` | PostgreSQL connection (Knex, migrations, E2E override) | Yes (db) |
| `HP_AWS_ACCESS_KEY_ID` | S3 image upload | Uploads only |
| `HP_AWS_SECRET_ACCESS_KEY` | S3 image upload | Uploads only |
| `HP_AWS_IMAGES_BUCKET` | S3 image bucket | Uploads only |
| `NEXT_PUBLIC_IMAGE_BUCKET_URL` | Public bucket URL | Images only |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | Error monitoring (disabled in dev) | No |

> Never commit secret values. `Sentry` is automatically disabled in development.

### Installation and development

```bash
pnpm install
pnpm run db:setup   # Docker + migrations + development data
pnpm run dev        # http://localhost:3000
```

`pnpm-lock.yaml` is the project's canonical lockfile; use pnpm to install
dependencies and run the scripts.

### Database

```bash
pnpm run db:migrate       # Apply migrations (knex migrate:latest)
pnpm run db:migrate:make -- migration_name # Create a new migration
pnpm run db:migrate:status # Show migration status
pnpm run db:rollback      # Revert the last migration
pnpm run db:create         # Create/start the local database (idempotent)
pnpm run db:seed           # Start PostgreSQL and load synthetic data
pnpm run db:seed:test      # E2E fixtures (test database)
pnpm run db:up             # Start local PostgreSQL on 54328
pnpm run db:down           # Stop local PostgreSQL
pnpm run db:logs           # Follow PostgreSQL logs
pnpm run db:check          # Check that PostgreSQL responds
pnpm run db:reset          # Delete the local volume and recreate everything
```

The development database uses `compose.dev.yaml` and port **54328**. The E2E database
uses `compose.e2e.yaml`, port **54329**, and deterministic fixtures; they are separate
databases. `db:reset` permanently deletes data from the local volume:
use it only when you want to start from scratch. It does not require `psql` to be installed on the
host; checks run inside the container.

Migration `0001_baseline` creates `shops` and `products` and is **not reversible** (`down()` intentionally throws an error). It requires the `uuid-ossp`, `pgcrypto`, and `pg_stat_statements` extensions (the latter must be preloaded — see `compose.e2e.yaml`). Compatible with Postgres 17.6.

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

Useful overrides: `PLAYWRIGHT_TEST_BASE_URL` (already-deployed app, skips local setup) and `PG_CONNECTION_STRING` (external database instead of the local Compose stack).

First time: `pnpm run test:e2e:install` (installs Chromium).

## CI

`.github/workflows/ci.yml` runs on every push and pull request: installs with pnpm using the frozen lockfile, runs quality checks and E2E tests in separate jobs, and uploads the Playwright report if a job fails.

## Available scripts

| Script | Description |
|---|---|
| `pnpm run dev` | Dev server (port 3000; `PORT=3001 pnpm run dev` for another port) |
| `pnpm run build` | Production build |
| `pnpm run start` | Serve the production build |
| `pnpm test` | Unit tests (Jest) |
| `pnpm run test:e2e` | E2E (Playwright + Docker) |
| `pnpm run test:e2e:install` | Install Chromium |
| `pnpm run lint` | Biome lint |
| `pnpm run db:migrate` / `db:migrate:make` / `db:migrate:status` / `db:rollback` | Knex migrations |
| `pnpm run db:seed` | Development seed |
| `pnpm run db:seed:test` / `db:seed:e2e` | E2E seed |
| `pnpm run db:create` / `db:up` / `db:down` / `db:logs` / `db:check` | Operate the local DB |
| `pnpm run db:setup` / `db:reset` | Set up / recreate the local DB |
| `pnpm run format` | Format code with Biome |
| `pnpm run format:check` | Check formatting with Biome |
| `pnpm run typecheck` | Check types with TypeScript |
| `pnpm run check` | Check formatting, lint, and imports with Biome |

## Deploy

Deploy to Vercel: configure the environment variables listed above (Sentry is enabled in production). No public deployment URLs are documented in this repository.

## Troubleshooting

- **Node.js**: use Node 22, as declared by `.tool-versions` and the CI workflow.
- **`pnpm run test:e2e` fails in global-setup**: Docker must be running (the setup runs `docker compose down --volumes && up --detach --wait` before migrating/seeding). Port 54329 is occupied → change it in `tests/e2e/fixtures/database.ts` and `compose.e2e.yaml`.
- **Local PostgreSQL**: `pg_stat_statements` must be in `shared_preload_libraries` (as in `compose.e2e.yaml`).

## Contributing

- Commits in [Conventional Commits](https://www.conventionalcommits.org/) format.
- Run `pnpm run lint` and `pnpm test` before opening a PR (E2E when touching flows).
- For each visual component, place styles in a `*.module.css` file alongside the component and import them as `styles`.
- Use semantic kebab-free camelCase class names (`containerLogo`, `shopName`) and apply them with `className={styles.nombre}`.
- Prefer CSS variables for values that change from React and keep visual states (`:hover`, `:focus`) in the module.
- AI agents: read [AGENTS.md](AGENTS.md) and use the skills in `.agents/skills/` when applicable.
