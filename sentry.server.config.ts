// This file configures the initialization of Sentry on the Node.js server.
// It is imported from `instrumentation.ts` (`register()`), per @sentry/nextjs
// 10 conventions. The config you add here will be used whenever the server
// handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { isSentryEnabled } from "#lib/utils/sentry";

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (isSentryEnabled() && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.25,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });
}
