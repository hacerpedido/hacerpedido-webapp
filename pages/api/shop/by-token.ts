// @ts-nocheck

import { saveShopWithProductsAction } from "#lib/actions/shop-editor";
import { validateShopEditorInput } from "#lib/validation/shop-editor";

import { withSentry } from "@sentry/nextjs";
import * as n from "nested-knex";

const pg = require("knex")({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
});

const handler = async (req, res) => {
  if (req.method === "POST") {
    // console.log("POST:", req.body)

    const { token, products } = req.body;

    if (!token || token === "") {
      res.status(400).json({ error: "Wrong parameters (1)." });
      return;
    }

    const validationError = validateShopEditorInput(req.body);
    if (validationError)
      return res.status(400).json({ error: validationError });

    // Keep this Pages API endpoint for existing editor clients, while routing
    // writes through the transactional mutation boundary.
    const result = await saveShopWithProductsAction(req.body, products ?? null);
    if (result.error) return res.status(400).json({ error: result.message });
    return res.json({ success: true, message: result.message });
  }

  const { token } = req.query;

  if (!token || token === "") {
    res.status(400).json({ error: "Wrong parameters (1)." });

    return;
  }

  const data = await n
    .type({
      id: n.number("shops.id", { id: true }),
      name: n.string("shops.name"),
      slug: n.string("shops.slug"),
      region: n.nullableString("shops.region"),
      category: n.nullableString("shops.category"),
      address: n.nullableString("shops.address"),
      notes: n.nullableString("shops.notes"),
      opentimes: n.nullableString("shops.opentimes"),
      deliverycost: n.nullableString("shops.deliverycost"),
      visibility: n.nullableString("shops.visibility"),
      logo: n.nullableString("shops.logo"),
      background: n.nullableString("shops.background"),
      ordersphonenumber: n.nullableString("shops.ordersphonenumber"),
      orderswhatsappnumber: n.nullableString("shops.orderswhatsappnumber"),
      typeformtoken: n.nullableString("shops.typeformtoken"),

      products: n.array(
        n.type({
          id: n.number("products.id", { id: true }),
          name: n.string("products.name"),
          category: n.nullableString("products.category"),
          price: n.number("products.price"),
          description: n.nullableString("products.description"),
          itemnumber: n.number("products.itemnumber"),
        }),
      ),
    })
    .withQuery(
      pg("shops")
        .where("typeformtoken", "=", token)
        .leftJoin("products", "shops.id", "products.shopid")
        .orderBy("products.itemnumber"),
    );

  // nested-knex devuelve un array vacío (truthy) cuando no hay shop para el
  // token; sin este guard la página renderiza un editor vacío en vez del
  // estado not-found. (#128)
  if (!data || (Array.isArray(data) && data.length === 0)) {
    res.status(404).json({ error: "No hay un comercio para ese token." });
    res.end();
    return;
  }

  res.status(200).json(data);
  res.end();
};

export default withSentry(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
