import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "lib/prisma"
import type { Shop, Product } from "types"

type ResponseData = {
  shop: Shop
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "PUT") {
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
      // token,
    } = req.body

    const newProducts = products.map((p: Product) => {
      return {
        category: p.category,
        name: p.name,
        description: p.description,
        price: p.price,
        itemnumber: p.itemnumber,
      }
    })

    const shop = await prisma.shop.update({
      where: { id: id },
      data: {
        address,
        deliverycost,
        name,
        notes,
        opentimes,
        ordersphonenumber,
        orderswhatsappnumber,
        // products: {
        //   set: newProducts,
        // },
      },
    })

    await prisma.product.deleteMany({ where: { shopid: id } })
    const createdProducts = await prisma.product.createMany(newProducts)

    res.json({ shop, products: createdProducts })
  }
}
