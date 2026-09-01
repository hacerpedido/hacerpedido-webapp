---
name: e2e-playwright
description: Run, fix and write Playwright E2E tests for HacerPedido (order flow, cart persistence, admin flow). Use when working with npm run test:e2e, playwright specs, tsetIDs/locators, the docker compose Postgres stack, global-setup/teardown, or browser test failures.
---

# E2E with Playwright

The E2E suite boots the whole app locally against a disposable PostgreSQL and drives the real user journeys in Chromium.

## When to use

- Running, fixing, or writing E2E specs (`tests/e2e/`)
- Debugging `npm run test:e2e` failures (global-setup, webServer, wa.me interception)
- Adding a new journey (e.g. shop browsing, cart, admin)

## How to run

```bash
npm run test:e2e          # full suite (boots compose, migrates, seeds, builds, serves, tests)
npm run test:e2e:install  # one-time: install Chromium
npx playwright test tests/e2e/order-flow.spec.js   # single spec
```

Requirements: **Docker** running (Postgres comes from `docker compose`). Node 22.

## What happens under the hood

1. `tests/e2e/global-setup.js`:
   - `docker compose --project-name hacerpedido-e2e -f compose.e2e.yaml down --volumes --remove-orphans`
   - `docker compose ... up --detach --wait` (Postgres 17.6 on `127.0.0.1:54329`, db `hacerpedido_e2e`, user `e2e_user` / `e2e_password`, `shared_preload_libraries=pg_stat_statements`)
   - `npx knex migrate:latest` + `npx knex seed:run` with `PG_CONNECTION_STRING` overridden to the compose DB (`tests/e2e/fixtures/database.js`)
2. `playwright.config.js` `webServer`: `npm run build && npm run start` against baseURL `http://127.0.0.1:3001` (180s timeout, no reuse).
3. Specs run in project `chromium`; reporters: HTML (`playwright-report/`) + JUnit (`test-results/junit.xml`).
4. `global-teardown.js` tears the compose stack down.

**External overrides** (preview/deployed envs): `PLAYWRIGHT_TEST_BASE_URL` + `PG_CONNECTION_STRING` — when the base URL host is not localhost, global setup/teardown and the local webServer are skipped entirely.

## Writing a new spec (recipe)

1. Create `tests/e2e/<journey>.spec.js`.
2. Use accessible locators / `testID`s. The order submit button uses `testID="submit-whatsapp-order"` (`Cart/Form.jsx`) — prefer `getByTestId` for it, semantic text otherwise.
3. **Intercept outgoing WhatsApp** instead of letting the browser navigate away:

```js
await page.route('https://wa.me/**', (route) => route.fulfill({ status: 200 }));
const navigation = page.waitForURL(/^https:\/\/wa\.me\/549/);
await page.getByTestId('submit-whatsapp-order').click({ noWaitAfter: true });
await navigation;
```

4. Fixtures: seed shops/products in `tests/e2e/fixtures/seeds/` (the fixture shop uses `orderswhatsappnumber: "+5491100000000"`).
5. Verify: `npm run test:e2e`.

## Gotchas

- **Docker down** → global-setup fails fast (`docker compose up --wait`). Start Docker first.
- **Port 54329 busy** → change both `compose.e2e.yaml` ports and the connection string in `tests/e2e/fixtures/database.js`.
- **Don't let wa.me navigate for real** — always `page.route('https://wa.me/**')` + `waitForURL`.
- CI (`node.js.yml`) runs `npx playwright install --with-deps chromium` then `npm run test:e2e` with `CI=1` (retries: 1, workers: 1).
- `--pass-with-no-tests` is set: a run finding zero specs passes silently — make sure your spec path is right.
- Test data lives in the E2E DB only; `npm run db:seed:e2e` reseeds it manually.
