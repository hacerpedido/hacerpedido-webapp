import { PrismaClient } from "@prisma/client"

import productFactory from "../tests/factories/product"
import shopFactory from "../tests/factories/shop"

import type { Shop, Product } from "types"

type newProduct = Omit<Product, "id" | "shopid" | "created_at" | "updated_at">
type ShopWithProducts = Omit<Shop, "id" | "created_at" | "updated_at"> & {
  products: { create: newProduct[] }
}

const prisma = new PrismaClient()

async function main() {
  const shopData = shopFactory.buildList(100)

  const shopsWithProducts: ShopWithProducts[] = shopData.map((shop) => {
    const randomNumber = Math.floor(Math.random() * (50 - 3 + 1) + 3)
    const products = productFactory.buildList(randomNumber)
    const shopWithProducts: ShopWithProducts = {
      ...shop,
      products: { create: products },
    }
    return shopWithProducts
  })

  await prisma.product.deleteMany()
  await prisma.shop.deleteMany()

  shopsWithProducts.forEach(async (data) => {
    await prisma.shop.create({ data })
  })
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
