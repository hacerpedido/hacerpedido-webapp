import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No other Next.js options are currently set; this file exists to wire the
  // Sentry build (webpack instrumentation + source map upload).
};

// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/webpack-setup/
export default withSentryConfig(nextConfig, {
  // Org/project slugs mirror sentry.properties (they are not secrets). They
  // can be overridden via SENTRY_ORG / SENTRY_PROJECT.
  org: process.env.SENTRY_ORG ?? "hp-0q",
  project: process.env.SENTRY_PROJECT ?? "hacerpedido",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload source maps when an auth token is available. Without a token the
  // plugin logs a warning and skips the upload instead of failing the build,
  // keeping local and CI builds green.
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
