const { createDevData } = require("../../factories");

exports.seed = async (knex) => {
  const data = createDevData();
  const shopIds = data.shops.map(({ id }) => id);
  await knex.transaction(async (trx) => {
    // Only remove the deterministic IDs owned by this seed; leave other local data intact.
    await trx("products").whereIn("shopid", shopIds).del();
    await trx("shops").whereIn("id", shopIds).del();
    await trx("shops").insert(data.shops);
    await trx("products").insert(data.products);
  });
};
