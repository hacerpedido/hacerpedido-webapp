import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import type { Product } from "types"

type SliceState = {
  shopId: number
  tempProducts: Product[]
}

const initialState: SliceState = {
  shopId: 0,
  tempProducts: [],
}

const shopEditSlice = createSlice({
  name: "shopEdit",
  initialState,
  reducers: {
    setTempProducts(state, { payload }: PayloadAction<SliceState>) {
      state.tempProducts = payload.tempProducts
    },
  },
})

export const { setTempProducts } = shopEditSlice.actions

export default shopEditSlice.reducer
