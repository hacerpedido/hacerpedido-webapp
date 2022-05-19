import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "lib/prisma"

import type { Shop } from "types"

const pg = require("knex")({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
})

type ResponseData = {
  shop: Shop
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { token } = req.query

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

  // TODO: should make typeformtoken unique and use findUnique
  const shop = await prisma.shop.findMany({
    where: { typeformtoken: token },
    include: {
      products: {
        orderBy: { itemnumber: "asc" },
      },
    },
  })

  res.json(shop[0])
}
