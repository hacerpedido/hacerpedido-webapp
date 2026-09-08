import { createDevData } from "#db/factories";
import {
  type NewProductRow,
  type NewShopRow,
  products as productsTable,
  shops,
} from "#db/schema";
import type { Database } from "#lib/db/client";

import { inArray, or } from "drizzle-orm";

export const seed = async (db: Database) => {
  const data = createDevData();
  const shopIds = data.shops.map(({ id }) => id);
  // The previous dev seed used the same product IDs but a different shop ID
  // namespace. Include those seed-owned shop IDs in the migration window so a
  // refresh does not leave the old 52 shops behind.
  const legacyShopIds = Array.from(
    { length: 52 },
    (_, index) =>
      `00000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`,
  );
  const managedShopIds = [...shopIds, ...legacyShopIds];
  const productIds = data.products.map(({ id }) => id);
  await db.transaction(async (tx) => {
    // Only remove deterministic IDs owned by this seed; leave other local data intact.
    await tx
      .delete(productsTable)
      .where(
        or(
          inArray(productsTable.id, productIds),
          inArray(productsTable.shopid, managedShopIds),
        ),
      );
    await tx.delete(shops).where(inArray(shops.id, managedShopIds));
    await tx.insert(shops).values(data.shops as unknown as NewShopRow[]);
    await tx
      .insert(productsTable)
      .values(data.products as unknown as NewProductRow[]);
  });
};
