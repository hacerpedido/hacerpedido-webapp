import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import type { Product, CategoryWithProducts, Shop } from "types"

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
    setShop: (state: any, action: PayloadAction<any>) => {
      const payload = action.payload
      const shopHasChanged = state.shop?.slug !== payload.slug

      if (shopHasChanged || !state.products?.length) {
        const products = payload.products || []

        state.shop = payload
        state.products = products.map((obj: CategoryWithProducts) => ({
          ...obj,
          amount: 0,
        }))
        state.totalAmount = initialState.totalAmount
      }
    },
    setAmount: (state: any, { payload }) => {
      const { product, amount } = payload
      const index = state.products.findIndex(
        (p: CategoryWithProducts) => p.id === product.id
      )

      if (amount >= 0) state.products[index].amount = amount

      state.totalAmount = state.products.reduce(
        (prev: number, p: CategoryWithProducts) => prev + p.amount,
        0
      )
    },
  },
})

export const { setShop, setAmount } = shopSlice.actions

export default shopSlice.reducer
