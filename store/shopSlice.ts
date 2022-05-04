import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import type { Product, Shop, ShopWithProducts } from "types"

// TODO: remove
type ProductAndAmount = {
  product: Product
  amount: number
}

type SliceState = {
  shop: Shop | null
  products: Product[]
  totalAmount: number
}

const initialState: SliceState = {
  shop: null,
  products: [],
  totalAmount: 0,
}

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setShop: (state, { payload }: PayloadAction<ShopWithProducts>) => {
      state.shop = payload
      const shopHasChanged = state.shop?.slug !== payload.slug

      if (shopHasChanged || !state.products.length) {
        const products = payload.products || []

        state.products = products.map((product: Product) => ({
          ...product,
          amount: 0,
        }))

        state.totalAmount = initialState.totalAmount
      }
    },
    setAmount: (state, { payload }: PayloadAction<ProductAndAmount>) => {
      const { product, amount } = payload
      const index = state.products.findIndex(
        (p: Product) => p.id === product.id
      )

      if (amount >= 0) state.products[index].amount = amount

      // INFO: p.amount can be null
      state.totalAmount = state.products.reduce(
        (prev: number, p: Product) => prev + (p.amount || 0),
        0
      )
    },
  },
})

export const { setShop, setAmount } = shopSlice.actions

export default shopSlice.reducer
