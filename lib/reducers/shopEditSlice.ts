import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  tempProducts: null,
}

const shopEditSlice = createSlice({
  name: "shopEdit",
  initialState,
  reducers: {
    setTempProducts(state, action) {
      const { tempProducts } = action.payload
      state.tempProducts = tempProducts
    },
  },
})

export const { setTempProducts } = shopEditSlice.actions

export default shopEditSlice.reducer
