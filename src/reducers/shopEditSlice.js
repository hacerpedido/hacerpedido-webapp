import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tempProducts: null,
};

const shopEditSlice = createSlice({
  name: "shopEdit",
  initialState: initialState,
  reducers: {
    setTempProducts(state, action) {
      let { tempProducts } = action.payload;
      state.tempProducts = tempProducts;
    },
  },
});

export const { setTempProducts } = shopEditSlice.actions;

export default shopEditSlice.reducer;
