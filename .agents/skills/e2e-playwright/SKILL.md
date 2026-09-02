---
name: e2e-playwright
description: Run, fix and write Playwright E2E tests for HacerPedido (order flow, cart persistence, admin flow). Use when working with pnpm run test:e2e, Playwright specs, testIDs/locators, the Docker Compose PostgreSQL stack, global setup/teardown, or browser test failures.
---

# E2E with Playwright

The E2E suite boots the whole app locally against a disposable PostgreSQL and drives the real user journeys in Chromium.

## When to use

- Running, fixing, or writing E2E specs (`tests/e2e/`)
- Debugging `pnpm run test:e2e` failures (global setup, webServer, wa.me interception)
- Adding a new journey (e.g. shop browsing, cart, admin)

## How to run

```bash
pnpm run test:e2e                              # full suite (boots compose, migrates, seeds, builds, serves, tests)
pnpm run test:e2e:install                      # one-time: install Chromium
pnpm exec playwright test tests/e2e/order-flow.spec.ts  # single spec
```

Requirements: **Docker** running (Postgres comes from `docker compose`). Node 22.

## What happens under the hood

1. `tests/e2e/global-setup.ts`:
   - `docker compose --project-name <derived> -f compose.e2e.yaml down --volumes --remove-orphans`
   - `docker compose ... up --detach --wait` (Postgres 17.6; on `127.0.0.1:54329` for the main checkout or on a derived port in a worktree lane, db `hacerpedido_e2e`, user `e2e_user` / `e2e_password`, `shared_preload_libraries=pg_stat_statements`)
   - `tsx scripts/db-migrate.ts` + `tsx tests/e2e/fixtures/setup.ts` with `PG_CONNECTION_STRING` overridden to the compose DB (`tests/e2e/fixtures/database.ts`)
2. `playwright.config.ts` `webServer`: `pnpm build && pnpm start -p <appPort>` against the matching baseURL (default `http://127.0.0.1:3001`; derived per worktree lane). Runs in the main checkout may reuse an existing local server; lane runs never reuse another lane's server.
3. Specs run in project `chromium`; reporters: HTML (`playwright-report/`, or `playwright-report/<run>/` in lanes) + JUnit (`test-results/junit.xml`, or `test-results/<run>/`).
4. `tests/e2e/global-teardown.ts` tears the compose stack down (best-effort).

**External overrides** (preview/deployed envs): `PLAYWRIGHT_TEST_BASE_URL` + `PG_CONNECTION_STRING` — when the base URL host is not localhost, global setup/teardown and the local webServer are skipped entirely.

## Writing a new spec (recipe)

1. Create `tests/e2e/<journey>.spec.ts`.
2. Use accessible locators / `testID`s. The order submit button uses `data-testid="submit-whatsapp-order"` (`components/Cart/Form.tsx`) — prefer `getByTestId` for it, semantic text otherwise.
3. **Intercept outgoing WhatsApp** instead of letting the browser navigate away:

```ts
await page.route('https://wa.me/**', (route) => route.fulfill({ status: 200 }));
const navigation = page.waitForURL(/^https:\/\/wa\.me\/549/);
await page.getByTestId('submit-whatsapp-order').click({ noWaitAfter: true });
await navigation;
```

4. Fixtures: seed shops/products in `tests/e2e/fixtures/seeds/` (the fixture shop uses `orderswhatsappnumber: "+5491100000000"`).
5. Verify: `pnpm run test:e2e`.

## Gotchas

- **Docker down** → global-setup fails fast (`docker compose up --wait`). Start Docker first.
- **Run context / busy ports** → worktree lanes derive their own project, ports, and volume automatically; the main checkout keeps `hacerpedido-e2e`, `54329`, and `3001`. Print the resolved values with `pnpm run test:e2e:info`; override with `E2E_RUN_ID`, `E2E_PROJECT_NAME`, `E2E_PG_PORT`, `E2E_APP_PORT`, `E2E_VOLUME_PREFIX`.
- **Don't let wa.me navigate for real** — always `page.route('https://wa.me/**')` + `waitForURL`.
- CI (`ci.yml`) runs `pnpm exec playwright install --with-deps chromium` then `pnpm test:e2e` with `CI=1` (retries: 1, workers: 1).
- `--pass-with-no-tests` is set: a run finding zero specs passes silently — make sure your spec path is right.
- Test data lives in the E2E DB only; `pnpm run db:seed:e2e` reseeds it manually.
