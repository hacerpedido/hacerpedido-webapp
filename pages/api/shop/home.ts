import prisma from "lib/prisma"

export default async function handle(req, res) {
  const { category } = req.query

  const shops = await prisma.shops.findMany({
    where: { visibility: "public", category },
    orderBy: { updated_at: "asc" },
  })

  res.status(200).json(shops)
  res.end()
}
