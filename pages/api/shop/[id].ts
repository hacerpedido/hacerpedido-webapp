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
      query: { id },
    } = req

    const {
      address,
      deliverycost,
      name,
      notes,
      opentimes,
      ordersphonenumber,
      orderswhatsappnumber,
      products,
    } = req.body

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
      },
    })

    products.forEach((p: Product) => (p.shopid = id))

    await prisma.product.deleteMany({ where: { shopid: id } })
    await prisma.product.createMany({
      data: products,
    })

    const updatedProducts = await prisma.product.findMany({
      where: { shopid: id },
    })

    res.json({ shop, products: updatedProducts })
  }
}
