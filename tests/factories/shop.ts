import faker from "@faker-js/faker"
import { Prisma } from "@prisma/client"
import { Factory } from "fishery"
import { sample } from "lodash"

import { categories } from "@/lib/utils/categories"
import type { Shop } from "types"

type newShop = Omit<Shop, "id" | "created_at" | "updated_at">

const shopFactory = Factory.define<newShop>(() => {
  return {
    address: faker.address.streetAddress(),
    background: faker.image.image(256, 256, true), // support https urls. Some should have a background and some not
    category: sample(categories) as string,
    logo: faker.image.abstract(256, 256, true),
    name: faker.company.companyName(),
    notes: faker.lorem.paragraph(),
    phonenumber: faker.phone.phoneNumber(), // TODO: should be optional
    region: faker.address.cityName(),
    slug: faker.unique(faker.lorem.slug),
    typeformtoken: faker.datatype.uuid(),
    visibility: "public",
    whatsappnumber: faker.phone.phoneNumber(), // TODO: should be optional
    ordersphonenumber: faker.phone.phoneNumber(),
    orderswhatsappnumber: faker.phone.phoneNumber(),
    ordersbyphoneorwhatsapp: faker.phone.phoneNumber(),
    username: "",
    delivery: sample(["Si", "No"]) as string,
    deliverycost: faker.datatype
      .number({
        min: 50,
        max: 500,
      })
      .toString(),
    email: faker.internet.email(),
    opentimes: "", // String?
    submittedat: faker.date.recent().toLocaleString(),
    takeaway: sample(["Si", "No"]) as string,
  }
})

export default shopFactory
