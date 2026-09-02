import type { Product, Shop } from "../types";
import {
  serializePublicShop,
  serializePublicShops,
} from "../utils/public-shop";

const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.PG_CONNECTION_STRING });
type ShopRow = Record<string, unknown> & {
  product_id?: number | string | null;
};

export async function getPublicShops(category: string): Promise<Shop[]> {
  const { rows } = await pool.query(
    `SELECT id, name, slug, region, category, address, notes, opentimes,
            deliverycost, visibility, logo, background, ordersphonenumber,
            orderswhatsappnumber
       FROM shops
      WHERE visibility = 'public' AND category = $1
      ORDER BY updated_at DESC`,
    [category],
  );
  return serializePublicShops<Pick<Shop, "slug">>(rows);
}

export async function getPublicShop(slug: string): Promise<Shop | null> {
  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.slug, s.region, s.category, s.address, s.notes,
            s.opentimes, s.deliverycost, s.visibility, s.logo, s.background,
            s.ordersphonenumber, s.orderswhatsappnumber,
            p.id AS product_id, p.name AS product_name, p.category AS product_category,
            p.price AS product_price, p.description AS product_description,
            p.itemnumber AS product_itemnumber
       FROM shops s
       LEFT JOIN products p ON s.id = p.shopid
      WHERE s.slug = $1 AND s.visibility = 'public'
      ORDER BY p.itemnumber`,
    [slug],
  );
  if (!rows.length) return null;

  const first = rows[0];
  const products: Product[] = rows
    .filter((row: ShopRow) => row.product_id != null)
    .map((row: ShopRow) => ({
      id: row.product_id,
      name: row.product_name,
      category: row.product_category,
      price: row.product_price,
      description: row.product_description,
      itemnumber: row.product_itemnumber,
    }));

  return serializePublicShop<Pick<Shop, "slug">>({ ...first, products });
}
