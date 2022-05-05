import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

const shopData: Prisma.ShopCreateInput[] = [
  {
    name: "Alice",
    products: {
      create: [
        {
          name: "Join the Prisma Slack",
        },
      ],
    },
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const s of shopData) {
    const user = await prisma.shop.create({
      data: s,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
