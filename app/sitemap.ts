import { getPublicShops } from "#lib/api/server-shops";
import { categories } from "#lib/utils/categories";

import type { MetadataRoute } from "next";

const SITE_URL = "https://hacerpedido.com";

/**
 * Sitemap for HacerPedido.
 *
 * Lists the home page and every public shop slug. `getPublicShops`
 * is wrapped in React `cache()`, so identical concurrent reads in
 * the same render share a single DB query. Per-entry `lastModified`
 * is intentionally omitted because the public shop serializer does
 * not surface `updated_at`; revisit if the SEO slice in #250 adds it.
 *
 * Covers #251. See #250 for the parent SEO/Lighthouse plan.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const shopLists = await Promise.all(
    categories.map((category) => getPublicShops(category)),
  );
  const allSlugs = shopLists.flat().map((shop) => shop.slug);
  const uniqueSlugs = [...new Set(allSlugs.filter(Boolean))];

  const homeEntry: MetadataRoute.Sitemap[number] = {
    changeFrequency: "daily",
    priority: 1,
    url: `${SITE_URL}/`,
  };
  const shopEntry = (slug: string): MetadataRoute.Sitemap[number] => ({
    changeFrequency: "weekly",
    priority: 0.8,
    url: `${SITE_URL}/${slug}`,
  });

  return [homeEntry, ...uniqueSlugs.map(shopEntry)];
}
