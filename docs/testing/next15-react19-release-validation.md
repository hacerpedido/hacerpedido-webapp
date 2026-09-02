# Next 16 / React 19 release validation

Validated stack: Next.js 16.3.4 and React 19.2.8.

This checklist is the acceptance evidence for the framework rollout. Run it on
the integrated branch containing the Next 16, React 19, and React 19 actions
changes; the framework validation branch may be used only as a pre-integration
baseline. Results must be recorded from the exact commit being considered for
release.

## Local matrix

Use Node 22 and a clean dependency install before running the matrix:

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm test --runInBand
pnpm run build
pnpm run test:e2e
```

The E2E command uses the configured Playwright web server and test database
setup. If the environment cannot provide the required database, AWS image
configuration, or Chromium installation, record the command as blocked rather
than treating a partial run as acceptance evidence.

## Acceptance coverage

The full Playwright run must include these existing specs:

| Acceptance area | Playwright coverage |
| --- | --- |
| WhatsApp URL and byte-stable order message | `tests/e2e/order-flow.spec.ts` |
| Cart persistence and clearing behavior | `tests/e2e/cart-persistence.spec.ts`, `tests/e2e/cart-interactions.spec.ts` |
| Checkout validation | `tests/e2e/cart-validation.spec.ts` |
| Public routes and SEO metadata | `tests/e2e/public-pages.spec.ts`, `tests/e2e/public-routing-seo.spec.ts` |
| Editor mutations and product management | `tests/e2e/admin-flow.spec.ts` |
| Image upload/delete workflow | **No existing Playwright coverage on this branch**; requires a staging/S3 smoke test before acceptance |

For a release result, retain the command output and Playwright report for the
candidate commit. The image workflow gap must be closed or explicitly accepted
by the release owner; a green local matrix does not imply image coverage. Do not
infer production readiness from local results alone.

## Rollback and rehearsal

Before cutover, rehearse the release against a preview/staging deployment:

1. Deploy the candidate commit and run the matrix above against that deployment.
2. Verify the public shop, cart, WhatsApp handoff, editor, and image workflows.
3. Keep the last known-good deployment identifier and its environment/configuration
   available for an immediate redeploy.
4. If a blocking regression is found, stop the rollout and redeploy that known-good
   version. Preserve the failed deployment logs and test report for diagnosis.
5. Re-run the smoke paths after rollback, then fix and repeat the candidate matrix
   before another cutover attempt.

This procedure is an operational rehearsal checklist, not evidence that a
production rollback has been performed. Database migrations must be reviewed
and rehearsed separately; do not run `db:rollback` against production as a
generic application rollback.

## Result record

Record the following with the release review:

- candidate commit and Node/pnpm versions;
- result of each local matrix command;
- Playwright browser, environment, and report location;
- any skipped or blocked workflow and its reason;
- known-good deployment identifier used for rollback rehearsal.
