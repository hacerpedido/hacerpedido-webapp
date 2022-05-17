export type CartFormValues = {
  name: string
  address: string
  notes: string
}

// NOTE: Replaces the use of this type with an array of products
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
  itemnumber?: number
  amount?: number // NOTE: only cart products include amounts
}

export type Shop = {
  address?: string
  background: string
  category: string
  deliverycost?: string
  id: string
  logo?: string
  name: string
  notes: string
  opentimes?: string
  ordersphonenumber: string
  orderswhatsappnumber: string
  region: string
  slug: string
  visibility: string
}
