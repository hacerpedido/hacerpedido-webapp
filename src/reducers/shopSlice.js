import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shop: null,
  products: []
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setShop(state, { payload }) {
      state.shop = payload;
      state.products = state.shop.productsByShopid?.nodes ?? [];
    }
  },
});

export const { setShop } = shopSlice.actions;

export default shopSlice.reducer;
