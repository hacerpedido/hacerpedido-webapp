export type Product = {
  id?: string
  name: string
  category: string
  description?: string
  price?: string
  shopid?: string
  itemNumber?: number
}

export type CartProduct = Product & {
  amount: number
}

export type Shop = {
  id?: string
  address?: string
  background: string
  category: string
  // delivery text,
  deliverycost?: string
  // email text,
  logo?: string
  name: string
  notes: string
  opentimes?: string
  // ordersByPhoneOrWhatsApp text,
  ordersphonenumber: string
  orderswhatsappnumber: string
  // phoneNumber text,
  region: string
  slug: string
  // submittedAt text,
  // takeaway text,
  // typeformToken text,
  // userName text,
  visibility: string
  // whatsAppNumber text,
}

export type CategoryWithProducts = {
  name: string
  products: Product[]
}
