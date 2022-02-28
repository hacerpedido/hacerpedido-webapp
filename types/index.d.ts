export type Product = {
  id?: string
  name: string
  category: string
  description?: string
  price?: string
  shopid?: string
  itemNumber?: number
  category: string
}

export type CartProduct = Product & {
  amount: number
}

export type Shop = {
  id?: string
  address?: string
  // background text,
  // category text,
  // delivery text,
  deliverycost?: string
  // email text,
  logo?: string
  name: string
  // notes text,
  opentimes?: string
  // ordersByPhoneOrWhatsApp text,
  // ordersPhoneNumber text,
  // ordersWhatsAppNumber text,
  // phoneNumber text,
  region: string
  slug: string
  // submittedAt text,
  // takeaway text,
  // typeformToken text,
  // userName text,
  // visibility text,
  // whatsAppNumber text,
}
