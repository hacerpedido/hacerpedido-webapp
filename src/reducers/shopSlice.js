import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shop: null
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setShop(state, { payload }) {
      state.shop = payload;
    },
  },
});

export const { setShop } = shopSlice.actions;

export default shopSlice.reducer;
