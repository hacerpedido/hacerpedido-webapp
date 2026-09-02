const knexFactory = require("knex");

const { productFactory, shopFactory } = require("#db/factories.js");

const SHOP_ID = "00000000-0000-0000-0000-000000000001";
const ADMIN_SAVE_SHOP_ID = "00000000-0000-0000-0000-000000000004";
const PUBLIC_FRESHNESS_SHOP_ID = "00000000-0000-0000-0000-000000000005";
const IMAGE_SHOP_ID = "00000000-0000-0000-0000-000000000006";

const shops = [
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
  shopFactory({
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
    visibility: "private",
    typeformtoken: "e2e-admin-save-token",
    whatsappnumber: "+5491100000000",
    ordersphonenumber: "+5491100000000",
    orderswhatsappnumber: "+5491100000000",
    created_at: "2020-01-01 00:00:00",
    updated_at: "2020-01-01 00:00:00",
  }),
  shopFactory({
    id: PUBLIC_FRESHNESS_SHOP_ID,
    name: "E2E Public Freshness Shop",
    slug: "e2e-public-freshness-shop",
    region: "E2E Region",
    category: "E2E Freshness",
    address: "E2E Freshness Address",
    notes: "E2E public freshness fixture",
    ordersbyphoneorwhatsapp: "whatsapp",
    opentimes: "E2E freshness hours",
    deliverycost: "0",
    visibility: "public",
    typeformtoken: "e2e-public-freshness-token",
    whatsappnumber: "+5491100000000",
    ordersphonenumber: "+5491100000000",
    orderswhatsappnumber: "+5491100000000",
    created_at: "2020-01-01 00:00:00",
    updated_at: "2020-01-01 00:00:00",
  }),
  shopFactory({
    id: IMAGE_SHOP_ID,
    name: "E2E Image Shop",
    slug: "e2e-image-shop",
    region: "E2E Region",
    category: "E2E Images",
    address: "E2E Image Address",
    visibility: "public",
    logo: "/logo512.png",
    background: "/logo512.png",
    typeformtoken: "e2e-image-token",
    orderswhatsappnumber: "+5491100000000",
  }),
];

const products = [
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
];

async function setup() {
  if (!process.env.PG_CONNECTION_STRING) {
    throw new Error("PG_CONNECTION_STRING is required for E2E fixture setup");
  }

  const knex = knexFactory({
    client: "pg",
    connection: process.env.PG_CONNECTION_STRING,
  });
  const shopIds = shops.map((shop) => shop.id);

  try {
    await knex.transaction(async (trx) => {
      await trx("products").whereIn("shopid", shopIds).del();
      await trx("shops").whereIn("id", shopIds).del();
      await trx("shops").insert(shops);
      await trx("products").insert(products);
    });
  } finally {
    await knex.destroy();
  }
}

setup().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
