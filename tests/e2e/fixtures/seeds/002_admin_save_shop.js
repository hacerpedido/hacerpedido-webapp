const { shopFactory } = require("#db/factories.js");

// This private shop is exclusively for the admin save E2E. Keeping it outside
// the public catalog fixture prevents that test's write from racing readers.
const ADMIN_SAVE_SHOP_ID = "00000000-0000-0000-0000-000000000004";

const adminSaveShop = shopFactory({
  id: ADMIN_SAVE_SHOP_ID,
  name: "E2E Admin Save Shop",
  slug: "e2e-admin-save-shop",
  region: "E2E Region",
  category: "Comida",
  address: "E2E Admin Address",
  notes: "E2E admin save fixture",
  ordersbyphoneorwhatsapp: "whatsapp",
  opentimes: "E2E admin hours",
  deliverycost: "0",
  // It remains available through the editor token but cannot affect public
  // catalog assertions or category navigation.
  visibility: "private",
  typeformtoken: "e2e-admin-save-token",
  whatsappnumber: "+5491100000000",
  ordersphonenumber: "+5491100000000",
  orderswhatsappnumber: "+5491100000000",
  created_at: "2020-01-01 00:00:00",
  updated_at: "2020-01-01 00:00:00",
});

exports.seed = async (knex) => {
  await knex.transaction(async (trx) => {
    await trx("products").where("shopid", ADMIN_SAVE_SHOP_ID).del();
    await trx("shops").where("id", ADMIN_SAVE_SHOP_ID).del();
    await trx("shops").insert(adminSaveShop);
  });
};
