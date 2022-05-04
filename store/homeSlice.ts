import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { categories } from "@/common/utils/categories"

import type { Shop } from "types"

type SliceState = {
  shops: Shop[]
  selectedFilter: string
}

const initialState: SliceState = {
  shops: [],
  selectedFilter: categories[0],
}

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setCategory(state, { payload }: PayloadAction<string>) {
      state.selectedFilter = payload
    },
    setShops(state, { payload }: PayloadAction<Shop[]>) {
      const newShops = payload

      state.shops = newShops.concat(
        state.shops.filter((bo: Shop) => {
          newShops.every((ao: Shop) => ao.id !== bo.id)
        })
      )
    },
  },
})

export const { setCategory, setShops } = homeSlice.actions

export default homeSlice.reducer
