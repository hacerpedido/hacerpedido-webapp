import prisma from "lib/prisma"

export default async function handle(req, res) {
  const { slug } = req.query

  if (!slug || slug === "") {
    res.status(400).json({ error: "Wrong parameters (1)." })
    return
  }

  const shop = await prisma.shops.findUnique({
    where: { slug: slug },
    include: {
      products: {
        orderBy: { itemnumber: "asc" },
      },
    },
  })

  res.status(200).json(shop)
  res.end()
}
