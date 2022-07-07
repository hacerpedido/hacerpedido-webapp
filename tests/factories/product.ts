import faker from "@faker-js/faker"
import { Prisma } from "@prisma/client"
import { Factory } from "fishery"
import { sample } from "lodash"

import type { Product } from "types"

type newProduct = Omit<Product, "id" | "shopid" | "created_at" | "updated_at">
const categories = ["Food", "Drinks", "Desserts"]

const productFactory = Factory.define<newProduct>(() => ({
  category: sample(categories) as string,
  name: faker.lorem.words(2),
  description: faker.lorem.paragraph(),
  price: new Prisma.Decimal(
    faker.datatype.float({
      min: 10,
      max: 1000,
      precision: 0.01,
    })
  ),
  itemnumber: 0, //TODO: numbers should be in order and unique per product (also required)
}))

export default productFactory
