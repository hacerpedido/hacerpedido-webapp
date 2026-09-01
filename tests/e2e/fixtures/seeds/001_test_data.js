const { productFactory, shopFactory } = require("../../../../db/factories");

const SHOP_ID = "00000000-0000-0000-0000-000000000001";
const seedData = {
  shops: [
    shopFactory({
      id: SHOP_ID,
      name: "E2E Fixture Shop",
      slug: "e2e-fixture-shop",
      region: "E2E Region",
      category: "Comida",
      address: "E2E Address",
      notes: "E2E fixture shop",
      ordersbyphoneorwhatsapp: "whatsapp",
      opentimes: "E2E hours",
      deliverycost: "0",
      visibility: "public",
      typeformtoken: "e2e-fixture-token",
      whatsappnumber: "+5491100000000",
      ordersphonenumber: "+5491100000000",
      orderswhatsappnumber: "+5491100000000",
      created_at: "2020-01-01 00:00:00",
      updated_at: "2020-01-01 00:00:00",
    }),
  ],
  products: [
    productFactory({
      id: "00000000-0000-0000-0000-000000000002",
      shopId: SHOP_ID,
      name: "E2E Product",
      category: "E2E Category",
      price: "1000",
      description: "E2E fixture product",
      itemnumber: 1,
      created_at: "2020-01-01 00:00:00",
      updated_at: "2020-01-01 00:00:00",
    }),
    productFactory({
      id: "00000000-0000-0000-0000-000000000003",
      shopId: SHOP_ID,
      name: "E2E Second Product",
      category: "E2E Category",
      price: "2500",
      description: "E2E second fixture product",
      itemnumber: 2,
      created_at: "2020-01-01 00:00:00",
      updated_at: "2020-01-01 00:00:00",
    }),
  ],
};

exports.seed = async (knex) => {
  await knex.transaction(async (trx) => {
    await trx("products").where("shopid", SHOP_ID).del();
    await trx("shops").whereIn("id", [SHOP_ID]).del();
    await trx("shops").insert(seedData.shops);
    await trx("products").insert(seedData.products);
  });
};
