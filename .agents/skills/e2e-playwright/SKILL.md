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
   - `docker compose --project-name hacerpedido-e2e -f compose.e2e.yaml down --volumes --remove-orphans`
   - `docker compose ... up --detach --wait` (Postgres 17.6 on `127.0.0.1:54329`, db `hacerpedido_e2e`, user `e2e_user` / `e2e_password`, `shared_preload_libraries=pg_stat_statements`)
   - `pnpm exec knex migrate:latest` + `pnpm exec knex seed:run` with `PG_CONNECTION_STRING` overridden to the compose DB (`tests/e2e/fixtures/database.ts`)
2. `playwright.config.ts` `webServer`: `pnpm build && pnpm start -p 3001` against baseURL `http://127.0.0.1:3001` (180s timeout; reuses a local server outside CI).
3. Specs run in project `chromium`; reporters: HTML (`playwright-report/`) + JUnit (`test-results/junit.xml`).
4. `tests/e2e/global-teardown.ts` tears the compose stack down.

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
- **Port 54329 busy** → change both `compose.e2e.yaml` ports and the connection string in `tests/e2e/fixtures/database.ts`.
- **Don't let wa.me navigate for real** — always `page.route('https://wa.me/**')` + `waitForURL`.
- CI (`ci.yml`) runs `pnpm exec playwright install --with-deps chromium` then `pnpm test:e2e` with `CI=1` (retries: 1, workers: 1).
- `--pass-with-no-tests` is set: a run finding zero specs passes silently — make sure your spec path is right.
- Test data lives in the E2E DB only; `pnpm run db:seed:e2e` reseeds it manually.
