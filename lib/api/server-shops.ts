import type { Product, Shop } from "../types";
import {
  serializePublicShop,
  serializePublicShops,
} from "../utils/public-shop";

const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.PG_CONNECTION_STRING });
type ShopRow = Record<string, unknown> & {
  product_id?: unknown;
};

type ShopWithProductsRow = ShopRow & {
  product_name?: unknown;
  product_category?: unknown;
  product_price?: unknown;
  product_description?: unknown;
  product_itemnumber?: unknown;
};

function normalizeString(value: unknown): string | undefined {
  if (value == null) return undefined;
  return String(value);
}

function normalizeNullableString(value: unknown): string | null {
  return value == null ? null : String(value);
}

function normalizeNullableInteger(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : null;
  }
  if (typeof value !== "string" || value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function productsFromRows(rows: ShopWithProductsRow[]): Product[] {
  return rows
    .filter((row) => row.product_id != null)
    .map((row) => ({
      id: normalizeString(row.product_id) as string,
      name: normalizeString(row.product_name) ?? "",
      category: normalizeNullableString(row.product_category),
      price: normalizeNullableString(row.product_price),
      description: normalizeNullableString(row.product_description),
      itemnumber: normalizeNullableInteger(row.product_itemnumber),
    }));
}

function shopFromRow(first: ShopWithProductsRow, products: Product[]): Shop {
  return {
    id: normalizeString(first.id),
    name: normalizeString(first.name),
    slug: normalizeString(first.slug) ?? "",
    region: normalizeString(first.region),
    category: normalizeString(first.category),
    address: normalizeString(first.address),
    notes: normalizeString(first.notes),
    opentimes: normalizeString(first.opentimes),
    deliverycost: normalizeNullableString(first.deliverycost),
    visibility: normalizeNullableString(first.visibility),
    logo: normalizeNullableString(first.logo),
    background: normalizeNullableString(first.background),
    ordersphonenumber: normalizeString(first.ordersphonenumber),
    orderswhatsappnumber: normalizeString(first.orderswhatsappnumber),
    typeformtoken: normalizeNullableString(first.typeformtoken),
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
  const normalizedShops = rows.map((row: ShopWithProductsRow) => {
    const shop = shopFromRow(row as ShopWithProductsRow, []);
    const {
      products: _products,
      typeformtoken: _typeformtoken,
      ...publicShop
    } = shop;
    return publicShop;
  });

  return serializePublicShops<Pick<Shop, "slug">>(normalizedShops);
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
