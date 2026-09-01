const { createDevData } = require("../../factories");

exports.seed = async (knex) => {
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
  await knex.transaction(async (trx) => {
    // Only remove deterministic IDs owned by this seed; leave other local data intact.
    await trx("products")
      .whereIn("id", productIds)
      .orWhereIn("shopid", managedShopIds)
      .del();
    await trx("shops").whereIn("id", managedShopIds).del();
    await trx("shops").insert(data.shops);
    await trx("products").insert(data.products);
  });
};
