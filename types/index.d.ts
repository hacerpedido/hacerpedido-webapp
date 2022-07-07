import type { Prisma, Shop, Product } from "@prisma/client"

export type Shop = Shop
export type Product = Product

const shopWithProducts = Prisma.validator<Prisma.ShopArgs>()({
  include: { products: true },
})

export type ShopWithProducts = Prisma.ShopGetPayload<typeof shopWithProducts>

export type CartFormValues = {
  name: string
  address: string
  notes: string
}

export type CartItem = Product & {
  quantity?: number
}
