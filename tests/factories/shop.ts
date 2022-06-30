import faker from "@faker-js/faker"
import { Factory } from "fishery"
import { sample } from "lodash"

// import productFactory from "./product"

import { categories } from "@/lib/utils/categories"
import { Shop } from "types"

const shopFactory: Factory<Shop> = Factory.define<Shop>(() => ({
  id: faker.datatype.uuid(),
  address: faker.address.streetAddress(),
  background: faker.image.imageUrl(), // support https urls. Some should have a background and some not
  category: sample(categories) as string,
  created_at: faker.date.recent(),
  logo: faker.image.imageUrl(),
  name: faker.company.companyName(),
  notes: faker.lorem.paragraph(),
  phonenumber: faker.phone.phoneNumber(), // TODO: should be optional
  region: faker.address.cityName(),
  slug: faker.unique(faker.lorem.slug),
  typeformtoken: faker.datatype.uuid(),
  updated_at: faker.date.recent(),
  visibility: "public",
  whatsappnumber: faker.phone.phoneNumber(), // TODO: should be optional

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
  // username                String?
  // whatsappnumber          String?
}))

export default shopFactory
