import { shopFactory } from "#db/factories";

import type { Knex } from "knex";

// This shop is only read by the public-catalog freshness regression. Its
// separate token and slug keep the editor mutation isolated from shared
// public fixture readers when Playwright runs spec files in parallel.
const PUBLIC_FRESHNESS_SHOP_ID = "00000000-0000-0000-0000-000000000005";

const publicFreshnessShop = shopFactory({
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
});

export const seed = async (knex: Knex) => {
  await knex.transaction(async (trx) => {
    await trx("products").where("shopid", PUBLIC_FRESHNESS_SHOP_ID).del();
    await trx("shops").where("id", PUBLIC_FRESHNESS_SHOP_ID).del();
    await trx("shops").insert(publicFreshnessShop);
  });
};
