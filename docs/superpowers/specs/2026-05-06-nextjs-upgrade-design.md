# Next.js Upgrade & Modernization — Design

**Date:** 2026-05-06
**Status:** Approved (pending user spec review)
**Owner:** Sergio Marquez

> Superseded note: This design describes the planned migration and its original
> Next 15-era target. The implementation now uses Next.js 16.3.4 and React
> 19.2.8; current operational guidance lives in `README.md` and `AGENTS.md`.

## Goals

Migrate the HacerPedido webapp from its current ~5-year-old stack to a modern Next.js foundation, eliminating accumulated tech debt (RNW, Bootstrap 4, Redux+persist boilerplate, the `--openssl-legacy-provider` hack, CDN-loaded Handsontable) and adopting current ecosystem conventions (App Router, RSC, Tailwind, shadcn/ui, server actions, TypeScript).

The rewrite is bounded by user-visible parity: every feature the current production app supports must work identically after cutover. WhatsApp message generation must be byte-identical. SEO output must be equivalent.

## Non-Goals

- Adding new product features.
- App Router migration "lite" that keeps RNW/Redux (rejected during brainstorming — yields no real benefit).
- Strangler-fig parallel-routers approach (rejected — requires a wasted intermediate Next 15 port of the legacy stack).
- Building a new repo (rejected — over-engineering for this app size).
- Full test suite buildout. (Out of scope; targeted golden-oracle tests only.)

## Target Stack

| Layer | From | To |
|---|---|---|
| Framework | Next 10.0.8 (Pages Router) | **Next 15 (App Router)** |
| React | 16.13.1 | **React 19** |
| Language | JavaScript | **TypeScript (strict)** |
| Views | React Native Web 0.13 | **Plain React + JSX** |
| Styling | StyleSheet + Bootstrap 4 + react-bootstrap | **Tailwind CSS + shadcn/ui** (TSX mode) |
| Client state | Redux Toolkit + redux-persist (5 slices) | **Zustand (cart only)** with `persist` middleware → localStorage; URL state via `useSearchParams` for filters; `useState` elsewhere |
| Server data | native `fetch` request layer → `app/api/*` → knex | **Server components query knex directly**; mutations via **server actions** |
| Image upload | `pages/api/image-upload.js` (formidable + AWS SDK v2) | **Route handler** `app/api/images/route.ts` (native `Request.formData()` + AWS SDK v3) |
| Forms | react-hook-form 6 | **react-hook-form 7 + zod** + `@hookform/resolvers` |
| Spreadsheet UI | Handsontable 8.2 (CDN `<script>`) | **Handsontable current + `@handsontable/react-wrapper`**, properly bundled |
| Error monitoring | @sentry/nextjs 7 | **@sentry/nextjs 8+** with `instrumentation.ts` |
| Package manager | npm | **bun** (with bun lockfile) |
| Node | 22 | 22 |
| Testing | Jest (sample tests only) | **bun test** for unit; **Playwright** for one E2E golden path |

### Dependencies to remove

`react-native-web`, `babel-plugin-react-native-web`, `react-native` (no direct usage besides `AppRegistry` in `_document.jsx`), `react-redux`, `@reduxjs/toolkit`, `redux-persist`, `bootstrap`, `react-bootstrap`, `aws-sdk` (v2 — replaced by modular `@aws-sdk/*` v3 packages), `formidable`, `react-image-crop` (replaced with current version, new API), `babel-eslint`, the entire `babel.config.js`, all `eslint-plugin-react-native*` packages.

### Dependencies to keep

`knex`, `pg`, `nested-knex`, `slugify`, `validator`, `react-gtm-module`. Browser-to-server requests use the native `fetch` request layer and internal App Router routes.

### Build/runtime cleanups (free wins)

- Drop `--openssl-legacy-provider` from all scripts.
- Delete `next.config.js` webpack alias (RNW-specific).
- Delete `babel.config.js` (Next 15 uses SWC).
- Replace `jsconfig.json` with `tsconfig.json`.
- `import-data` script ports to `scripts/import-data.ts` and runs via `bun run scripts/import-data.ts` — no Babel build step.

## Architecture

### Directory layout

```
app/
  layout.tsx                 # root layout, fonts, GTM, providers
  page.tsx                   # home: shop listings (RSC)
  [slug]/page.tsx            # shop detail (RSC)
  [...params]/page.tsx       # legacy catch-all if needed (RSC)
  cart/page.tsx              # cart ("use client" — Zustand)
  edit/[token]/
    page.tsx                 # admin edit shop
    products/page.tsx        # admin edit products (Handsontable)
  api/
    images/route.ts          # POST upload, DELETE — multipart, AWS SDK v3
  globals.css                # Tailwind directives
  not-found.tsx
  error.tsx
components/
  ui/                        # shadcn primitives (button, dialog, sheet, input, ...)
  shop/                      # ShopCard, FilterBar, ShopHeader, ProductList, ...
  cart/                      # CartSheet, CartItem, WhatsAppButton
  edit/                      # EditShopForm, EditProductsGrid, UploadImage
lib/
  db/
    client.ts                # knex singleton, "import 'server-only'"
    shops.ts                 # getShopsByCategory, getShopBySlug, getShopByToken
    products.ts              # getProductsForShop, ...
  actions/                   # server actions: saveShop, saveProduct, deleteProduct
  cart/store.ts              # Zustand + persist
  utils/
    whatsapp.ts              # sanitizeWhatsAppNumber, buildOrderMessage
    categories.ts
    slug.ts
  validation/                # zod schemas (shared form + action validation)
sentry.client.config.ts
sentry.server.config.ts
sentry.edge.config.ts
instrumentation.ts
```

### Data flow

**Reads (home, shop pages):** server components in `app/page.tsx` and `app/[slug]/page.tsx` call functions from `lib/db/shops.ts` directly. No client-side fetch, no loading skeleton for initial data. Cache strategy starts as `force-dynamic` (every request hits the DB), with ISR as a future optimization once the rewrite is stable.

**Mutations (admin save shop/product/delete):** server actions defined in `lib/actions/`. Each action receives form data, validates with the corresponding zod schema in `lib/validation/`, calls knex, and invokes `revalidatePath()` on the affected pages. No `pages/api/shop/*` equivalents in the new app.

**Image upload/delete:** stays as route handlers (`app/api/images/route.ts`) because server actions are awkward with multipart form data. Handler reads `request.formData()`, streams to S3 via `@aws-sdk/client-s3`, returns the URL.

**Cart:** client-only. Zustand store with `persist` middleware writes to localStorage. Cart page (`app/cart/page.tsx`) and cart UI components are `"use client"`. Cart icon/badge in the header is a client component embedded in the server-rendered layout.

**Forms:** react-hook-form 7 + zod resolvers. The same zod schema is imported by both the form (client validation) and the server action (server validation).

### Component boundaries

- Default to server components.
- Mark `"use client"` only at leaf interactive components: cart UI, filter bar, edit forms, image cropper, Handsontable grid.
- Pages and layouts are server components that compose client components — never the inverse.

### Sentry integration

Per `@sentry/nextjs` 8 conventions:
- `instrumentation.ts` at repo root, exports `register()` that initializes server-side Sentry.
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` — three separate configs as required.
- Sentry continues to be disabled in development (`NODE_ENV === 'development'` short-circuit), matching current behavior.
- DSN from `NEXT_PUBLIC_SENTRY_DSN` (existing env var).

## Migration Plan

Single long-lived branch: `next15-rewrite` off `master`. Production stays on Next 10 throughout. Big-bang cutover on merge.

### Phase 0 — Scaffolding (1–2 days)

1. Branch `next15-rewrite` off `master`.
2. Run **Phase 0.5 (Golden Oracle)** before any deletions. The DB-sample step needs prod DB access; the URL/HTML capture steps run against prod and are unaffected by local changes, but doing all of Phase 0.5 first means the captured fixtures land in the first commit on the rewrite branch.
3. Delete: `pages/`, `components/`, `lib/reducers/`, `babel.config.js`, `styles/`, `next.config.js`, `app.json`, `sentry.*.config.js`. Keep `lib/utils/` and `lib/api/` temporarily for reference; delete at end of Phase 4.
4. `bun create next-app` over the top: TS, Tailwind, App Router, ESLint. Resolve any merge conflicts.
5. `bunx shadcn@latest init` — TSX mode, default theme baseline.
6. Install runtime deps: `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`, `knex`, `pg`, `@sentry/nextjs@^8`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `slugify`, `validator`, `react-gtm-module`, `@handsontable/react-wrapper`, `handsontable`.
7. Install dev deps: `@types/pg`, `@types/validator`, `playwright`, `@playwright/test`.
8. Set up `lib/db/client.ts` with the `server-only` import guard.
9. Port `lib/utils/categories.ts`, `lib/utils/whatsapp.ts`, `lib/utils/slug.ts` to TS with types.
10. Set up Sentry: `instrumentation.ts` + three config files. Verify Sentry stays off in dev.
11. **Gate:** `bun run dev` boots cleanly. Empty home page renders. Sentry test event flows in production-like build.

### Phase 0.5 — Golden Oracle (~half day, runs first within Phase 0)

Capture concrete reference outputs from the current production app. These become test fixtures for the rewrite — the new app must reproduce them. All capture steps run against prod or a clean checkout of the legacy app; nothing depends on the new scaffold.

1. **WhatsApp URL fixtures** (`tests/fixtures/whatsapp.json`): 5–10 entries, each `{ shop, cart, expectedUrl }`. Method: run the legacy app locally against a copy of prod data, walk through the cart flow with curated inputs (varying phone-number formats, product counts, special characters in names/notes), copy the generated WhatsApp URL. Goal: cover the edge cases in `sanitizeWhatsAppNumber()` and message-formatting logic.
2. **Shop-page HTML snapshots** (`tests/fixtures/shop-pages/<slug>.html`): `curl https://hacerpedido.com/<slug>` for 2–3 representative live shops; save raw HTML. Phase 1 gate diffs the new app's rendered HTML against these for `<title>`, `<meta>`, OG tags, and structured data.
3. **DB samples** (`tests/fixtures/db/shops.json`, `tests/fixtures/db/products.json`): export ~3 shops + their products from prod via `pg_dump --data-only` or a direct `SELECT … json_agg(…)`. Used as reference for typing the new data layer and as seed data for local rewrite-branch dev.

The golden oracle is checked into the rewrite branch and consumed by Phase 1+ tests.

### Phase 1 — Read paths (3–5 days)

1. Implement `lib/db/shops.ts` (`getShopsByCategory`, `getShopBySlug`, `getShopByToken`) and `lib/db/products.ts` (`getProductsForShop`).
2. Build `app/page.tsx` (home) — RSC, fetches shops by category, renders ShopCard grid.
3. Build `app/[slug]/page.tsx` (shop detail) — RSC, fetches shop + products, renders ShopHeader + ProductList.
4. Build `components/shop/*` primitives in plain React + Tailwind + shadcn (Button, Card, Sheet, etc.).
5. Build `components/shop/FilterBar.tsx` — client component, URL state via `useSearchParams` + `useRouter`.
6. Implement `generateMetadata()` for `[slug]/page.tsx` matching legacy OG/Twitter tags.
7. Compare rendered HTML against `tests/fixtures/shop-pages/` — manual diff at phase gate. `<title>`, `<meta>`, OG/Twitter tags, and structured data must match (content can differ if it correctly reflects updated shop data; tag presence and shape must not).
8. **Gate:** browse home → category filter changes URL and result set → click shop → see products. SEO metadata matches golden oracle.

### Phase 2 — Cart + WhatsApp (2–3 days)

1. `lib/cart/store.ts` — Zustand store with `persist` middleware; actions: `addItem`, `removeItem`, `updateQuantity`, `clear`.
2. `app/cart/page.tsx` + `components/cart/CartSheet.tsx` — client components reading the store.
3. Add-to-cart buttons on shop pages (client leaf components).
4. Port `lib/utils/whatsapp.ts` with full TS types. Unit tests in `lib/utils/whatsapp.test.ts` using `tests/fixtures/whatsapp.json` — every fixture must round-trip exactly.
5. **Playwright golden-path E2E** in `tests/e2e/order.spec.ts`: home → filter category → click shop → add 2 products → open cart → click WhatsApp → assert URL matches expected pattern derived from fixtures.
6. **Gate:** WhatsApp unit tests pass; Playwright E2E passes; cart persists across page reloads.

### Phase 3 — Admin (4–6 days)

1. `app/edit/[token]/page.tsx` — server component fetches shop by token, passes to client `EditShopForm` component.
2. `components/edit/EditShopForm.tsx` — react-hook-form 7 + zod, fields for name/category/contact/visibility/delivery/hours.
3. Server actions in `lib/actions/`: `saveShop(token, formData)`, `saveProduct`, `deleteProduct`. Each validates with the shared zod schema, calls knex, calls `revalidatePath`.
4. `app/api/images/route.ts` — POST (upload) and DELETE handlers using `@aws-sdk/client-s3`. Replaces `pages/api/image-upload.js` + `pages/api/image-delete.js`.
5. `components/edit/UploadImage.tsx` — uses current `react-image-crop` API.
6. `app/edit/[token]/products/page.tsx` + `components/edit/EditProductsGrid.tsx` — Handsontable via `@handsontable/react-wrapper`, properly bundled (not CDN).
7. **Gate:** end-to-end edit a real shop on a staging environment — change name, upload an image, edit products grid, verify changes persist and shop page reflects them.

### Phase 4 — Cleanup + cutover (1–2 days)

1. Delete `lib/api/`, any leftover RNW references, `old/` directory, unused legacy assets.
2. Verify all env vars present on prod host: `PG_CONNECTION_STRING`, AWS creds + bucket, `NEXT_PUBLIC_SENTRY_DSN`, GTM ID.
3. Final dependency audit: `bun pm ls` — confirm no rogue legacy deps remain.
4. Deploy preview URL, smoke-test against the golden oracle fixtures.
5. Merge `next15-rewrite` → `master`, deploy to prod, monitor Sentry for the first 24h.

### Estimate

~2–3 weeks of focused work for a single dev. Realistic side-project calendar time: 4–6 weeks.

## Testing Strategy

Out of scope: comprehensive coverage. In scope, scoped to protect the rewrite:

- **Golden-oracle fixtures** captured pre-rewrite (Phase 0.5).
- **Unit tests** (~10 total) on ported pure utilities — `whatsapp.ts`, `slug.ts`, `categories.ts` — using bun's built-in test runner. WhatsApp tests consume the JSON fixtures.
- **One Playwright E2E** covering the golden path: home → filter → shop → add to cart → WhatsApp URL assertion. Runs as part of Phase 2 gate and stays in the repo as future regression net.
- **Manual smoke tests** at each phase gate, checking the user-visible flow described in that phase.

No tests written against current code. No retrofit of existing utilities until they're ported.

## Risk Register

| Risk | Mitigation |
|---|---|
| `knex`/`pg` native bindings incompatible with bun | Verify Day 1 of Phase 0; fall back to pnpm before Phase 1 if broken (5-min change, low cost). |
| Handsontable license terms changed | Verify before Phase 3; fall back to a shadcn-based row-form UI if commercial license required and undesired. |
| AWS SDK v2 → v3 API differences | Standard migration; allocate extra time in Phase 3 for the route-handler port. |
| Production shop slugs indexed/shared externally | Phase 1 gate requires URL parity; spot-check top shops before merge. |
| localStorage cart data lost at cutover | Acceptable — cart is ephemeral. Document in changelog/release notes. |
| TS strictness vs rewrite velocity | If strict mode becomes a bottleneck mid-rewrite, relax `noImplicitAny` temporarily; tighten before merge. |
| SEO regression on shop pages | Phase 1 gate compares rendered HTML against captured fixtures. |
| WhatsApp URL format drift | Phase 2 unit tests against fixtures must round-trip exactly. |
| Dev-only Sentry leakage with new SDK | Verify the `NODE_ENV === 'development'` guard is preserved in `instrumentation.ts`. |

## Open Items at Time of Writing

None. All major decisions resolved during brainstorming.

## Out-of-Scope Follow-ups (post-merge)

- ISR/caching tuning for shop pages.
- Comprehensive test suite buildout.
- AWS SDK v3 modular optimizations / bundle-size review.
- Lighthouse/perf audit and image optimization via `next/image` for product images.
