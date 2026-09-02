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

type ShopWithProductsRow = ShopRow & {
  product_name?: string | number | null;
  product_category?: string | null;
  product_price?: string | number | null;
  product_description?: string | null;
  product_itemnumber?: number | null;
};

function productsFromRows(rows: ShopWithProductsRow[]): Product[] {
  return rows
    .filter((row) => row.product_id != null)
    .map((row) => ({
      id: row.product_id as number | string,
      name: row.product_name ?? "",
      category: row.product_category ?? null,
      price: row.product_price ?? null,
      description: row.product_description ?? null,
      itemnumber: row.product_itemnumber ?? null,
    }));
}

function shopFromRow(first: ShopWithProductsRow, products: Product[]): Shop {
  return {
    id: first.id as Shop["id"],
    name: first.name as Shop["name"],
    slug: first.slug as Shop["slug"],
    region: first.region as string | undefined,
    category: first.category as Shop["category"],
    address: first.address as Shop["address"],
    notes: first.notes as Shop["notes"],
    opentimes: first.opentimes as Shop["opentimes"],
    deliverycost: first.deliverycost as Shop["deliverycost"],
    visibility: first.visibility as Shop["visibility"],
    logo: first.logo as Shop["logo"],
    background: first.background as Shop["background"],
    ordersphonenumber: first.ordersphonenumber as Shop["ordersphonenumber"],
    orderswhatsappnumber:
      first.orderswhatsappnumber as Shop["orderswhatsappnumber"],
    typeformtoken: first.typeformtoken as string | null | undefined,
    products,
  };
}

function shopWithProducts(rows: ShopWithProductsRow[]): Shop | null {
  if (!rows.length) return null;

  const first = rows[0];
  const products = productsFromRows(rows);

  return shopFromRow(first, products);
}

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

  const first = rows[0] as ShopWithProductsRow;
  const products = productsFromRows(rows as ShopWithProductsRow[]);

  return serializePublicShop<Pick<Shop, "slug">>(shopFromRow(first, products));
}

/**
 * Load the editor token for the development-only link on a public shop page.
 *
 * Keep the environment check here as well as at the call site so this helper
 * can never become another way of loading editor secrets in production (or in
 * tests, which exercise the public data path).
 */
export async function getDevelopmentShopEditToken(
  slug: string,
): Promise<string | null> {
  if (process.env.NODE_ENV !== "development") return null;

  const { rows } = await pool.query(
    `SELECT typeformtoken
       FROM shops
      WHERE slug = $1 AND visibility = 'public'`,
    [slug],
  );

  const token = rows[0]?.typeformtoken;
  return typeof token === "string" ? token : null;
}

/** Load a shop for the private editor token, including its products. */
export async function getShopByToken(token: string): Promise<Shop | null> {
  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.slug, s.region, s.category, s.address, s.notes,
            s.opentimes, s.deliverycost, s.visibility, s.logo, s.background,
            s.ordersphonenumber, s.orderswhatsappnumber, s.typeformtoken,
            p.id AS product_id, p.name AS product_name, p.category AS product_category,
            p.price AS product_price, p.description AS product_description,
            p.itemnumber AS product_itemnumber
       FROM shops s
       LEFT JOIN products p ON s.id = p.shopid
      WHERE s.typeformtoken = $1
      ORDER BY p.itemnumber`,
    [token],
  );

  return shopWithProducts(rows as ShopWithProductsRow[]);
}
