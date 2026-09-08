/**
 * Sentry is enabled only for Vercel production deployments.
 *
 * It must not run in tests, CI, or preview deployments: there is no auth token
 * (so release/source-map upload would warn), error reporting is not wanted for
 * previews, and it adds unnecessary noise to local and CI builds.
 *
 * `VERCEL_ENV` is set by Vercel to `production`, `preview`, or `development`.
 * It is unset outside Vercel (local and CI), so the check also excludes those.
 */
export function isSentryEnabled(): boolean {
  return process.env.VERCEL_ENV === "production";
}
