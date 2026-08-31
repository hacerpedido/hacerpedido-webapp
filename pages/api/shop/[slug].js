import * as n from "nested-knex";
import { withSentry } from '@sentry/nextjs';

const pg = require("knex")({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
});

const handler = async (req, res) => {
  const { slug } = req.query;

  if (!slug || slug === "") {
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
        })
      ),
    })
    .withQuery(
      pg("shops")
        .where("slug", "=", slug)
        .where("shops.visibility", "=", "public")
        .leftJoin("products", "shops.id", "products.shopid")
        .orderBy("products.itemnumber")
    );

  res.status(200).json(data);
  res.end();
}

export default withSentry(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
