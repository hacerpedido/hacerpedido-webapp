# Next/React migration characterization baseline (#179)

The existing unit and Playwright fixtures provide a behavior baseline before
changing the Next/React implementation. The covered contracts are:

- Argentine phone normalization, WhatsApp URL generation, and encoded order
  messages (`lib/utils/utils-phone-whatsapp.test.js`)
- Cart reducer behavior and localStorage hydration/persistence
  (`lib/context/CartContext.test.jsx`)
- Cart validation, persistence, and WhatsApp handoff using the deterministic
  E2E shop fixture (`tests/e2e/`)
- Public home/shop routing and shop Open Graph metadata
  (`tests/e2e/public-routing-seo.spec.ts`)

## Verification

Run from the repository root:

```sh
npm test -- --runInBand lib/utils/utils-phone-whatsapp.test.js lib/context/CartContext.test.jsx
# PASS — 2 suites, 61 tests

npm run test:e2e -- --project=chromium
# PASS — 14 tests
```

The E2E command provisions its isolated PostgreSQL fixture database and
removes the Docker resources during teardown. The build emits the existing
Next.js warning that React 17.0.1 or newer is recommended; it does not fail
the build or tests. No production credentials or data are required.
