import { PrismaClient } from "@prisma/client"

export default async function handle(req, res) {
  const prisma = new PrismaClient()
  const { category } = req.query

  const shops = await prisma.shop.findMany({
    where: { visibility: "public", category },
    orderBy: { updated_at: "asc" },
  })

  res.json(shops)
}
