import { products as productsTable, shops } from "#db/schema";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import type { Product, Shop } from "../types";
import {
  serializePublicShop,
  serializePublicShops,
} from "../utils/public-shop";

const db = getDb();

/**
 * Legacy flat-row shape used by the row normalizers below. The typed Drizzle
 * rows (snake_case column names, nested product for the joined queries) are
 * flattened back into this shape so the existing normalization and
 * serialization contracts stay byte-for-byte identical.
 */
type ShopWithProductsRow = Record<string, unknown> & {
  product_id?: unknown;
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

/** Columns exposed by the public (and editor-by-token) shop reads. */
const shopPublicColumns = {
  id: shops.id,
  name: shops.name,
  slug: shops.slug,
  region: shops.region,
  category: shops.category,
  address: shops.address,
  notes: shops.notes,
  opentimes: shops.opentimes,
  deliverycost: shops.deliverycost,
  visibility: shops.visibility,
  logo: shops.logo,
  background: shops.background,
  ordersphonenumber: shops.ordersphonenumber,
  orderswhatsappnumber: shops.orderswhatsappnumber,
} as const;

/** Product columns selected as a nested `product` object (single LEFT JOIN). */
const productColumns = {
  product_id: productsTable.id,
  product_name: productsTable.name,
  product_category: productsTable.category,
  product_price: productsTable.price,
  product_description: productsTable.description,
  product_itemnumber: productsTable.itemnumber,
} as const;

/** Flatten a joined row (nested product) back to the legacy flat shape. */
function toLegacyRows(rows: unknown[]): ShopWithProductsRow[] {
  return (rows as Array<Record<string, unknown> & { product?: unknown }>).map(
    (row) => {
      const { product, ...shopColumns } = row;
      return {
        ...shopColumns,
        ...((product as Record<string, unknown> | null | undefined) ?? {}),
      } as ShopWithProductsRow;
    },
  );
}

export async function getPublicShops(category: string): Promise<Shop[]> {
  const rows = await db
    .select(shopPublicColumns)
    .from(shops)
    .where(and(eq(shops.visibility, "public"), eq(shops.category, category)))
    .orderBy(desc(shops.updated_at));

  const normalizedShops = rows.map((row) => {
    const shop = shopFromRow(row as unknown as ShopWithProductsRow, []);
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
  const rows = await db
    .select({ ...shopPublicColumns, product: productColumns })
    .from(shops)
    .leftJoin(productsTable, eq(productsTable.shopid, shops.id))
    .where(and(eq(shops.slug, slug), eq(shops.visibility, "public")))
    .orderBy(productsTable.itemnumber);
  if (!rows.length) return null;

  const legacyRows = toLegacyRows(rows);
  const first = legacyRows[0];
  const products = productsFromRows(legacyRows);

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

  const rows = await db
    .select({ typeformtoken: shops.typeformtoken })
    .from(shops)
    .where(and(eq(shops.slug, slug), eq(shops.visibility, "public")))
    .limit(1);

  const token = rows[0]?.typeformtoken;
  return typeof token === "string" ? token : null;
}

/** Load a shop for the private editor token, including its products. */
export async function getShopByToken(token: string): Promise<Shop | null> {
  const rows = await db
    .select({
      ...shopPublicColumns,
      typeformtoken: shops.typeformtoken,
      product: productColumns,
    })
    .from(shops)
    .leftJoin(productsTable, eq(productsTable.shopid, shops.id))
    .where(eq(shops.typeformtoken, token))
    .orderBy(productsTable.itemnumber);

  return shopWithProducts(toLegacyRows(rows));
}
