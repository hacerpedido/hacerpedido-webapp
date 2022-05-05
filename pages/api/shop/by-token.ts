import * as n from "nested-knex"

import prisma from "lib/prisma"

const pg = require("knex")({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
})

export default async function handle(req, res) {
  if (req.method === "POST") {
    const {
      id,
      address,
      deliverycost,
      name,
      notes,
      opentimes,
      ordersphonenumber,
      orderswhatsappnumber,
      token,
      products,
    } = req.body

    // const updateShop = await prisma.shop.update({
    //   where: {
    //     typeformtoken: token,
    //   },
    //   data: {
    //     address,
    //     deliverycost,
    //     name,
    //     notes,
    //     opentimes,
    //     ordersphonenumber,
    //     orderswhatsappnumber,
    //   },
    // })
    // use connectorcreate for products

    if (!token || token === "") {
      res.status(400).json({ error: "Wrong parameters (1)." })
      return
    }

    pg("shops")
      .update({
        address,
        deliverycost,
        name,
        notes,
        opentimes,
        ordersphonenumber,
        orderswhatsappnumber,
      })
      .where("typeformtoken", "=", token)
      .then((rows) => {
        // console.log("update shop")

        if (!rows) {
          return res.status(404).json({ success: false })
        }
      })
      .catch((e) => console.error(e))

    if (!products || products.length == 0) {
      return res.json({
        success: true,
        message: "Tus cambios fueron guardados.",
      })
    }

    await pg("products").where("shopid", "=", id).delete()
    // .then(a => console.log("deleted products:", a))

    await pg("products").insert(products)
    // .then(a => console.log("updated products:", a))

    return res.json({
      success: true,
      message: "Tus cambios fueron guardados..",
    })
  }

  const { token } = req.query

  if (!token || token === "") {
    res.status(400).json({ error: "Wrong parameters (1)." })

    return
  }

  const shop = await prisma.shops.findUnique({
    where: { typeformtoken: token },
    include: {
      products: {
        orderBy: { itemnumber: "asc" },
      },
    },
  })

  res.status(200).json(shop)
  res.end()
}
