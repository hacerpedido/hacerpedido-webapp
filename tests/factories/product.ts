import faker from "@faker-js/faker"
import { Factory } from "fishery"

// import shopFactory from "./shop"

import { categories } from "@/lib/utils/categories"

import { Product } from "types"

const productFactory: Factory<Product> = Factory.define<Product>(() => ({
  id: faker.datatype.uuid(),
  category: categories[0],
  name: faker.lorem.words(2),
  description: faker.lorem.paragraph(),

  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),

  // shopid: shopFactory.build().id,
  // price       String?
  // itemnumber  Int?
  // shops       shops     @relation(fields: [shopid], references: [id])
}))

export default productFactory
