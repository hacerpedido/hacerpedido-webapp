export type CartFormValues = {
  name: string
  address: string
  notes: string
}

export type CartItem = Product & {
  quantity?: number
}

export type Product = {
  id?: string
  name: string
  category: string
  description?: string
  price?: string
  shopid?: string // shopid: string
  itemnumber?: number
  created_at?: Date
  updated_at?: Date
}

export type Shop = {
  id?: string
  address?: string
  background: string
  category: string
  deliverycost?: string
  logo?: string
  name: string
  notes: string
  opentimes?: string
  ordersphonenumber?: string // NOTE: we should have a messaging phone and other phones
  orderswhatsappnumber?: string
  region: string
  slug: string
  visibility: string
  created_at?: Date
  updated_at?: Date
  typeformtoken?: string
}
