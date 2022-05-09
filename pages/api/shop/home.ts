import { categories } from "@/common/utils/categories"
import prisma from "lib/prisma"

export default async function handle(req, res) {
  const { category = categories[0] } = req.query

  const shop = await prisma.shops.findMany({
    where: { visibility: "public", category: category },
    orderBy: { updated_at: "asc" },
  })

  res.status(200).json(shop)
  res.end()
}
