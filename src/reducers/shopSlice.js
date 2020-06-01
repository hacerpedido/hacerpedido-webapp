import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shop: undefined
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
