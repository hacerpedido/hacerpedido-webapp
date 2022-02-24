export type Product = {
  id?: number
  name: string
  category: string
  description?: string
  price?: number
  // shopid: shopID,
  // itemnumber: itemNumber,
}

export type CartProduct = Product & {
  amount: number
}

export type Shop = {
  id: number
  slug: string
  name: string
  address: string
  logo: string
  opentimes: string
  deliverycost: string
}
