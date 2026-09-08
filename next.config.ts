import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

// Mirror the public image bucket (NEXT_PUBLIC_IMAGE_BUCKET_URL) under Vercel's
// image optimizer. The optimizer emits WebP/AVIF, serves responsive widths,
// and caches at the edge. Keep this list aligned with the bucket whitelisted
// in the deployment; if the env var is unset (local build without aws creds)
// we fall back to allow-any so dev still boots. See issue #139.
const imageBucketUrl = process.env.NEXT_PUBLIC_IMAGE_BUCKET_URL ?? "";
let imageBucketHostname = "**";
try {
  if (imageBucketUrl) {
    imageBucketHostname = new URL(imageBucketUrl).hostname;
  }
} catch {
  // Invalid env var: fall back to allow-any to keep dev unblocked.
  imageBucketHostname = "**";
}

const nextConfig: NextConfig = {
  // No framework options besides the image config below. The file still wires
  // Sentry (webpack instrumentation + source map upload).
  images: {
    // AVIF is preferred where the browser supports it; WebP is the fallback.
    // Both are smaller than the JPEG/PNG we serve from S3.
    formats: ["image/avif", "image/webp"],
    // The S3 key is `${shopId}-${imageType}-${random10}.${ext}`, so each
    // upload produces a new URL. Cache transformed variants at the edge for
    // a year to keep Vercel from re-encoding on repeat visits.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      {
        protocol: imageBucketUrl.startsWith("https://") ? "https" : "http",
        hostname: imageBucketHostname,
        pathname: "/**",
      },
    ],
  },
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
