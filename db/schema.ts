/**
 * Drizzle schema — single TypeScript authority for the public schema.
 *
 * The migration history under `db/drizzle` is built from this file. See
 * `docs/database-schema.md` for the canonical schema contract.
 *
 * History notes:
 *   * `0000_init` snapshots the production schema as it exists today: tables
 *     `shops`/`products` with production constraint names (`shops_slug_key`,
 *     `products_shopid_fkey`) but WITHOUT the secondary indexes (never applied
 *     to production yet — see issue #130/#222).
 *   * `0001_catalog_indexes` adds the approved secondary indexes.
 *   * Custom SQL migrations (extensions, functions, triggers, search_path
 *     pinning) live in later numbered files and are not modelable by Drizzle.
 */

import { relations, sql } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const shops = pgTable(
  "shops",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v1()`),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    region: text("region").notNull(),
    username: text("username"),
    category: text("category"),
    address: text("address"),
    notes: text("notes"),
    ordersbyphoneorwhatsapp: text("ordersbyphoneorwhatsapp"),
    delivery: text("delivery"),
    takeaway: text("takeaway"),
    whatsappnumber: text("whatsappnumber"),
    phonenumber: text("phonenumber"),
    email: text("email"),
    submittedat: text("submittedat"),
    opentimes: text("opentimes"),
    deliverycost: text("deliverycost"),
    visibility: text("visibility"),
    logo: text("logo"),
    background: text("background"),
    typeformtoken: text("typeformtoken"),
    ordersphonenumber: text("ordersphonenumber"),
    orderswhatsappnumber: text("orderswhatsappnumber"),
    created_at: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: false }).defaultNow(),
  },
  (table) => [
    // Constraint names mirror production (0001_baseline).
    unique("shops_slug_key").on(table.slug),
    // Catalog lookup: public shops by category, freshest first (issue #130/#222).
    index("idx_shops_public_category_updated_at")
      .on(table.category, table.updated_at.desc().nullsFirst())
      .where(sql`${table.visibility} = 'public'`),
    // Editor lookup by typeformtoken (issue #130/#222).
    index("idx_shops_typeformtoken").on(table.typeformtoken),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v1()`),
    category: text("category").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    price: text("price"),
    shopid: uuid("shopid").notNull(),
    itemnumber: integer("itemnumber"),
    created_at: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: false }).defaultNow(),
  },
  (table) => [
    // Constraint name mirrors production (0001_baseline).
    foreignKey({
      name: "products_shopid_fkey",
      columns: [table.shopid],
      foreignColumns: [shops.id],
    }).onDelete("no action"),
    // Shop detail / editor join ordering (issue #130/#222).
    index("idx_products_shopid_itemnumber").on(table.shopid, table.itemnumber),
  ],
);

export const shopsRelations = relations(shops, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  shop: one(shops, {
    fields: [products.shopid],
    references: [shops.id],
  }),
}));

export type ShopRow = typeof shops.$inferSelect;
export type NewShopRow = typeof shops.$inferInsert;
export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
