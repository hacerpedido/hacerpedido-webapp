import faker from "@faker-js/faker"
import { Factory } from "fishery"

// import productFactory from "./product"

import { categories } from "@/lib/utils/categories"
import { Shop } from "types"

const shopFactory: Factory<Shop> = Factory.define<Shop>(() => ({
  id: faker.datatype.uuid(),
  address: faker.address.streetAddress(),
  background: null,
  category: categories[0],
  name: faker.company.companyName(),
  notes: faker.lorem.paragraph(),
  region: faker.address.cityName(),
  slug: faker.unique(faker.lorem.slug),
  visibility: "public",
  logo: faker.image.imageUrl(), // TODO:

  created_at: faker.date.recent(),
  updated_at: faker.date.recent(),

  // products: productFactory.buildList(20),
  // delivery                String?
  // deliverycost            String?
  // email                   String?
  // opentimes               String?
  // ordersbyphoneorwhatsapp String?
  // ordersphonenumber       String?
  // orderswhatsappnumber    String?
  // phonenumber             String?
  // products                products[]
  // submittedat             String?
  // takeaway                String?
  // typeformtoken           String?
  // username                String?
  // whatsappnumber          String?
}))

export default shopFactory
