import { createSlice } from "@reduxjs/toolkit"

import type { Shop } from "types"

type SliceState = {
  shops: Shop[]
  selectedFilter: string
  firstVisibleItem: number
}

const initialState: SliceState = {
  shops: [],
  selectedFilter: "Comida",
  firstVisibleItem: 0,
}

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setFirstVisibleItem(state, { payload }) {
      state.firstVisibleItem = payload
    },
    setCategory(state, { payload }) {
      state.firstVisibleItem = 0
      state.selectedFilter = payload
    },
    setShops(state, action) {
      const newShops = action.payload
      state.shops = newShops.concat(
        // TODO: should use shop type
        state.shops.filter((bo: Shop) => {
          newShops.every((ao: Shop) => ao.id !== bo.id)
        })
      )
    },
  },
})

export const { setCategory, setFirstVisibleItem, setShops } = homeSlice.actions

export default homeSlice.reducer
