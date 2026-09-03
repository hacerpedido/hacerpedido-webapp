# AGENTS.md

Context for AI agents working in this repository (Claude Code, opencode, Cursor, Gemini, Copilot, Codex). More detailed situational knowledge is available in the skills under `.agents/skills/`; human guidance is in [README.md](README.md).

## Project

HacerPedido: webapp (Next.js + React) where customers build an order from a shop's storefront and send it via WhatsApp (`wa.me` with a pre-built message). Shops manage their page through a Typeform token.

Language conventions:
- UI/product copy: **Spanish** (Argentina).
- Commits, docs, tests, and messages in this file: **English**.
- All repository documentation and guidelines must be written in **English**. UI/product copy remains **Spanish** (Argentina) until bilingual/i18n support is intentionally introduced.
- Do not add AI attribution ("Co-Authored-By") to commits.

## Stack (pinned versions)

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3.4 (App Router), React 19.2.8 |
| UI | CSS Modules + Bootstrap 4.6 (semantic HTML) |
| State | CartContext (useReducer + localStorage) |
| HTTP | Native `fetch` request layer → internal App Router API routes |
| DB | PostgreSQL 17.6 (Supabase) via Drizzle over `pg` |
| Files | AWS SDK v3 → S3 |
| Observability | @sentry/nextjs 10 (instrumentation + source maps, disabled in dev) |
| Tooling | TypeScript (`tsconfig.json`, `typecheck`), Biome (format/lint), Lefthook (pre-commit) |
| Testing | Jest 30 (unit), Playwright (E2E) |

## Critical conventions

- **Web UI with CSS Modules**: every visual component must use a `*.module.css` file alongside the component and import its classes as `styles`. Use `className={styles.nombre}` and CSS variables for dynamic values; do not add global styles.
- **State**: CartContext with `useReducer` + localStorage persistence (`CartProvider` in `app/providers.tsx`, `useCart` hook). There is no Redux.
- **API**: use native `fetch` for browser requests to internal routes in `app/api/`; route handlers access PostgreSQL.
- **WhatsApp/phone numbers**: Argentine numbers. **Always** normalize with `sanitizeWhatsAppNumber()` before building a `wa.me` link (54 + 0/9 rules). See the `whatsapp-order` skill.
- **Images**: S3 upload/delete via `lib/utils/aws-s3.ts`, endpoint in `app/api/images/route.ts`.

## Repository map

```
app/
  page.tsx                  Home: shops by category
  [slug]/page.tsx           Public shop page
  [slug]/edit/page.tsx      Token-based shop management
  cart/page.tsx             Checkout → generates wa.me link
  api/images/route.ts       Upload/delete S3
  api/shop/home/route.ts    Shops by category
  api/shop/[slug]/route.ts  Shop by slug
  api/shop/by-token/route.ts Management by token
  api/shop/editor/route.ts  Editor mutations
  layout.tsx, providers.tsx, error.tsx, global-error.tsx, loading.tsx, not-found.tsx
components/
  Home/                     HomeHeader, HomeFilterBar, ShopCard
  Shop/                     ShopView, ShopHeader, ShopFooter, Product, ProductList, ProductAmountPopup, ShopNotes
  Cart/                     Header, Form, Product, ProductList
  EditShop/                 EditShop, EditProducts, UploadImage
  primitivas                Input, Form, Switch, MessageBox, ShopInput, Loading, Divider, DecoratedLabel
lib/
  api/                      native fetch request layer, server-shops.ts, shops.ts
  context/                  CartContext.tsx (useReducer + localStorage)
  utils/                    TypeScript helpers (WhatsApp, prices, products, shops, categories, S3)
  hooks/                    use_width.ts
  graphql/                  shop.ts (legacy, Apollo commented out)
db/
  schema.ts                  shops + products (typed Drizzle authority)
  drizzle/                   0000_init.sql … versioned migrations + journal
  factories.ts               typed factories for seeds/tests
tests/
  unit                      API tests; unit/component tests also in lib/ and components/ (JS/JSX)
  e2e/                      TypeScript specs: order-flow, cart-persistence, cart-validation, admin-flow, fixtures/
assets/                     colors.ts, theme.ts, backgrounds.ts
public/                     manifest.json, favicon, logos, og_image.jpg, robots.txt
docs/superpowers/           Documentation

Sentry (v10 layout, see the `2026-05-06-nextjs-upgrade-design.md` doc):
next.config.ts            wraps Next config with `withSentryConfig`
instrumentation.ts        register() loads sentry.server/edge configs; onRequestError
instrumentation-client.ts client init + onRouterTransitionStart
sentry.server.config.ts / sentry.edge.config.ts   SDK init per runtime
```

## Commands

| Command | What it does |
|---|---|
| `pnpm install` / `pnpm dev` | Install dependencies / start the development server |
| `pnpm run dev` | Dev server (port 3000; `PORT=3001 pnpm run dev` for another port) |
| `pnpm run build` / `pnpm run start` | Build / serve production |
| `pnpm test` | Jest (unit/component tests in `lib/`, `components/`, and `tests/unit/`) |
| `pnpm run test:e2e` | Playwright E2E. Boots `docker compose` (Postgres 17.6, port 54329), runs migrations + seed, builds & serves the app (`pnpm run build && pnpm run start`), baseURL `http://127.0.0.1:3001` |
| `pnpm run test:e2e:install` | Install Chromium |
| `pnpm run lint` | Biome lint (`.`) |
| `pnpm run db:migrate` / `db:migrate:status` | Drizzle migrations (`db/drizzle`, forward-only) |
| `pnpm run db:migrate:make` | `drizzle-kit generate` (add `--custom` for hand-written SQL) |
| `pnpm run db:seed` | Drizzle dev seed (`db/seeds/dev/001_dev_data.ts`) |
| `pnpm run db:seed:e2e` / `db:seed:test` | Drizzle seed (`tests/e2e/fixtures/seeds/001_test_data.ts`) |
| `pnpm run format` | Biome format on supported files |
| `pnpm run format:check` | Check formatting with Biome |
| `pnpm run typecheck` | Check types with TypeScript |
| `pnpm run check` | Check formatting, lint, and imports with Biome |

Environment notes:
- Use **Node 22** (declared in `.tool-versions` and CI).
- CI uses pnpm 11.25.0 and installs with `pnpm install --frozen-lockfile`.
- E2E: overrides `PLAYWRIGHT_TEST_BASE_URL` (deployed app, skips Compose) and `PG_CONNECTION_STRING` (external database).

## Environment variables

Names only — never print or commit values:

`PG_CONNECTION_STRING` (required for db/scripts/E2E), `HP_AWS_ACCESS_KEY_ID`, `HP_AWS_SECRET_ACCESS_KEY`, `HP_AWS_IMAGES_BUCKET`, `NEXT_PUBLIC_IMAGE_BUCKET_URL`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (source map upload), `SENTRY_ORG`, `SENTRY_PROJECT`.

## Testing expectations

- Jest for pure logic and components (`lib/`, `components/`) and API (`tests/unit/`) — keep existing tests green when touching helpers.
- Playwright E2E for journeys: the order flow **intercepts `wa.me`** (`page.route('https://wa.me/**')` + `waitForURL`, see `order-flow.spec.ts`).
- Biome is the repository's formatter and linter; Lefthook runs `biome check --write` on staged files before each commit.
- Before finishing a task with tests: `pnpm run lint` + `pnpm test`. E2E requires Docker; if it is unavailable, report that it was not run.

## GitHub issues

- GitHub is the source of truth for the project issue list. Search existing issues before creating a new one: `gh issue list --state all` and `gh issue list --search "<terms>"`.
- Use the GitHub CLI for every issue operation. Do not create or modify issues through another interface.
- Check the repository's current labels with `gh label list` before creating or editing an issue. Use only labels that already exist; do not invent label names.
- Create issues with `gh issue create --title "..." --body "..." --label "<existing-label>"`.
- Modify issues with `gh issue edit <number>`, and close them with `gh issue close <number>` when the work is complete.
- Use the exact priority labels configured in the repository, such as `priority-low`, `priority-medium`, or `priority-high`.
- Include the issue number in the implementation context and link the completing pull request or commit before closing the issue.
- Pull requests must target `master` and link the relevant issue with `Closes #<number>` (or an equivalent GitHub closing keyword).
- This repository does not require `status:*` or `type:*` labels for pull requests. Use only labels that exist when labeling issues or pull requests.

## Project skills

Load the relevant skill when the task matches its description (progressive disclosure — load only what is needed):

- `checkout` — checkout, cart persistence, validation, and WhatsApp handoff
- `drizzle-migrations` — migrations, seed, shops/products schema
- `e2e-playwright` — run/build E2E, Compose stack
- `shop-cart-debugging` — diagnose listings, shop details, and cart state
- `whatsapp-order` — order flow, phone numbers, wa.me links, cart
- `s3-images` — image upload/delete, AWS

## Guardrails

- Conventional Commits; no AI attribution; no empty commits or force-pushes.
- Migrations: maintain compatibility with **Postgres 17.6** (without `pgjwt`, `timescaledb`, `plv8`). Baseline `0000_init` is **not reversible** and migrations are forward-only; `pg_stat_statements` must be preloaded (see `compose.e2e.yaml`). RLS is enabled in prod but **disabled in the E2E database** — do not make RLS decisions assuming full parity.
- Sensitive data (env, real seed) must never be committed.
