// 0002_add_secondary_indexes.js
// Secondary indexes justified by EXPLAIN (ANALYZE, BUFFERS) measurements run
// against the real production database (Supabase project xpnthjdzqrnpgwzquszb,
// 2026-09-02) plus the catalog growth expectation tracked in #130/#222.
//
// Evidence (production: 800 shops, 11 882 products, 13 public shops):
//   * products(shopid, itemnumber):
//       - public shop by slug + products: 3.56 ms / 355 buffers  -> 0.57 ms / 79
//       - editor by token + products:     3.54 ms / 351 buffers  -> 0.46 ms / 71
//     Without it both joins seq-scan the full products table.
//   * shops(category, updated_at DESC) WHERE visibility = 'public':
//       - today the catalog is a 0.37 ms seq scan over 800 rows; this partial
//         index is added proactively because the public catalog is expected to
//         grow (#222) and it remains small (only public rows).
//   * shops(typeformtoken):
//       - the editor lookup currently seq-scans shops (0.3 ms at 800 rows);
//         this index keeps it an index scan as the shop count grows.
//
// Plain CREATE INDEX is used (runs inside the Knex transaction). The tables
// are small today (11 882 products); if production sizes grow materially before
// this ships, convert it to a CONCURRENTLY-based migration (transaction: false)
// instead.
const SQL_UP = `
CREATE INDEX IF NOT EXISTS idx_products_shopid_itemnumber
  ON public.products (shopid, itemnumber);

CREATE INDEX IF NOT EXISTS idx_shops_public_category_updated_at
  ON public.shops (category, updated_at DESC)
  WHERE visibility = 'public';

CREATE INDEX IF NOT EXISTS idx_shops_typeformtoken
  ON public.shops (typeformtoken);
`;

const SQL_DOWN = `
DROP INDEX IF EXISTS public.idx_products_shopid_itemnumber;
DROP INDEX IF EXISTS public.idx_shops_public_category_updated_at;
DROP INDEX IF EXISTS public.idx_shops_typeformtoken;
`;

exports.up = (knex) => knex.raw(SQL_UP);
exports.down = (knex) => knex.raw(SQL_DOWN);
