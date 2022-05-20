export type CartItem = Product & {
  quantity?: number
}

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
  id: string
  name: string
  category: string
  description?: string
  price?: string
  shopid?: string // shopid: string
  itemnumber?: number
  created_at: Date
  updated_at: Date
}

export type Shop = {
  id: string
  address?: string
  background: string
  category: string
  deliverycost?: string
  logo?: string
  name: string
  notes: string
  opentimes?: string
  ordersphonenumber?: string // NOTE: should be one or the other. Use better validation
  orderswhatsappnumber?: string
  region: string
  slug: string
  visibility: string

  created_at: Date
  updated_at: Date
}
