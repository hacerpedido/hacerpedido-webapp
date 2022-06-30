import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "lib/prisma"
import type { Product } from "types"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    const id = String(req.query.id)

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
