export type CartFormValues = {
  name: string
  address: string
  notes: string
}

export type CategoryWithProducts = {
  name: string
  products: Product[]
}

export type Product = {
  id?: string
  name: string
  category: string
  description?: string
  price?: string
  shopid?: string
  itemNumber?: number
  amount?: number // NOTE: only cart products include amounts
}

export type Shop = {
  address?: string
  background: string
  category: string
  deliverycost?: string
  id?: string
  logo?: string
  name: string
  notes: string
  opentimes?: string
  ordersphonenumber: string
  orderswhatsappnumber: string
  region: string
  slug: string
  visibility: string
  // delivery text
  // email text
  // ordersByPhoneOrWhatsApp text
  // phoneNumber text
  // submittedAt text
  // takeaway text
  // typeformToken text
  // userName text
  // whatsAppNumber text
}

export type ShopWithProducts = Shop & {
  products: Product[]
}
