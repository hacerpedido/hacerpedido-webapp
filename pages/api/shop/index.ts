import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "lib/prisma"
import type { Shop } from "types"

type ResponseData = {
  shops: Shop[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { category } = req.query

  const shops = await prisma.shop.findMany({
    where: { visibility: "public", category },
    orderBy: { updated_at: "desc" },
  })

  res.json(shops)
}
