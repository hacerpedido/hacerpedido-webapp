import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hacerpedido.com";

/**
 * robots.txt for HacerPedido.
 *
 * Public routes are open. Internal API routes and the checkout are
 * blocked from indexing; everything else (including the shop edit
 * routes, which are never reached from public links) is implicitly
 * allowed by the absence of a matching Disallow rule. The sitemap is
 * exposed so crawlers can discover the catalogue directly.
 *
 * Covers #251. See #250 for the parent SEO/Lighthouse plan.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/cart"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
