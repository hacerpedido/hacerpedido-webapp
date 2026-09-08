// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited. It is the
// v10 replacement for the former `sentry.client.config.js` (auto-loaded when
// `withSentryConfig` wraps `next.config`).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const isDevelopmentOrTest =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

if (!isDevelopmentOrTest && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });
}

// Instrument client-side router navigations (required by @sentry/nextjs 10).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
