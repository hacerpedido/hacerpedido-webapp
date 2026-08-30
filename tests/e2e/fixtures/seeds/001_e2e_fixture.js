// Deterministic E2E seed aligned with the real production schema.
// Test-only fixture, never used in production.

const SHOP_ID = "00000000-0000-0000-0000-000000000001";
const PRODUCT_ID = "00000000-0000-0000-0000-000000000002";
const SECOND_PRODUCT_ID = "00000000-0000-0000-0000-000000000003";

exports.seed = async (knex) => {
  await knex("products")
    .del()
    .whereIn("id", [PRODUCT_ID, SECOND_PRODUCT_ID]);
  await knex("shops").del().where("id", "=", SHOP_ID);

  await knex("shops").insert({
    id: SHOP_ID,
    name: "E2E Fixture Shop",
    slug: "e2e-fixture-shop",
    region: "E2E Region",
    username: null,
    category: "Comida",
    address: "E2E Address",
    notes: "E2E fixture shop",
    ordersbyphoneorwhatsapp: "whatsapp",
    delivery: null,
    takeaway: null,
    whatsappnumber: "+5491100000000",
    phonenumber: null,
    email: null,
    submittedat: null,
    opentimes: "E2E hours",
    deliverycost: "0",
    visibility: "public",
    logo: null,
    background: null,
    typeformtoken: "e2e-fixture-token",
    ordersphonenumber: "+5491100000000",
    orderswhatsappnumber: "+5491100000000",
    created_at: "2020-01-01 00:00:00",
    updated_at: "2020-01-01 00:00:00",
  });

  await knex("products").insert({
    id: PRODUCT_ID,
    shopid: SHOP_ID,
    name: "E2E Product",
    category: "E2E Category",
    price: "1000",
    description: "E2E fixture product",
    itemnumber: 1,
    created_at: "2020-01-01 00:00:00",
    updated_at: "2020-01-01 00:00:00",
  });

  await knex("products").insert({
    id: SECOND_PRODUCT_ID,
    shopid: SHOP_ID,
    name: "E2E Second Product",
    category: "E2E Category",
    price: "2500",
    description: "E2E second fixture product",
    itemnumber: 2,
    created_at: "2020-01-01 00:00:00",
    updated_at: "2020-01-01 00:00:00",
  });
};
