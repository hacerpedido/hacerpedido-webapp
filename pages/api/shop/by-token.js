import { withSentry } from '@sentry/nextjs';
import * as n from "nested-knex";

const pg = require("knex")({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
});

const handler = async(req, res) => {

  if (req.method === 'POST') {
    // console.log("POST:", req.body)

    const {
      id,
      address,
      deliverycost,
      name,
      notes,
      opentimes,
      ordersphonenumber,
      orderswhatsappnumber,
      token, products } = req.body;

    if (!token || token === "") {
      res.status(400).json({ error: "Wrong parameters (1)." });
      return;
    }

    pg("shops")
      .update({
        address,
        deliverycost,
        name,
        notes,
        opentimes,
        ordersphonenumber,
        orderswhatsappnumber
      })
      .where("typeformtoken", "=", token)
      .then(rows => {
        // console.log("update shop")

        if (!rows) {
          return res.status(404).json({ success: false });
        }
      })
      .catch(e => console.error(e));

    if (!products || products.lenght == 0) {
      return res.json({
        success: true,
        message: "Tus cambios fueron guardados.",
      });
    }

    await pg("products")
      .where("shopid", "=", id)
      .delete()
      // .then(a => console.log("deleted products:", a))

    await pg('products')
      .insert(products)
      // .then(a => console.log("updated products:", a))

    return res.json({
      success: true,
      message: "Tus cambios fueron guardados..",
    });
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
        })
      ),
    })
    .withQuery(
      pg("shops")
        .where("typeformtoken", "=", token)
        .leftJoin("products", "shops.id", "products.shopid")
        .orderBy("products.itemnumber")
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
}

export default withSentry(handler);
