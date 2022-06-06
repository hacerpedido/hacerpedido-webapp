import { Prisma } from "@prisma/client"

// import productFactory from "../tests/factories/product"
import shopFactory from "../tests/factories/shop"

import prisma from "lib/prisma"

const shopData: Prisma.ShopCreateInput[] = shopFactory.buildList(100)
// const productData: Prisma.ProductCreateInput[] = productFactory.buildList(100)

async function main() {
  await prisma.shop.deleteMany()
  await prisma.shop.createMany({ data: shopData })

  // const products = await prisma.product.createMany({
  //   data: productData,
  // })
}

// eslint-disable-next-line jest/require-hook
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
