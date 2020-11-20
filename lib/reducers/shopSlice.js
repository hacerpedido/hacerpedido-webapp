import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shop: null,
  products: [],
  totalAmount: 0,
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setShop(state, { payload }) {
      const shopHasChanged = state.shop?.slug !== payload.slug;

      if (shopHasChanged || !state.products?.length) {
        const products = payload.productsByShopid?.nodes || [];

        state.shop = payload;
        state.products = products.map((obj) => ({ ...obj, amount: 0 }));
        state.totalAmount = initialState.totalAmount;
      }
    },
    setAmount(state, { payload }) {
      const { product, amount } = payload;
      const index = state.products.findIndex((p) => p.id === product.id);

      if (amount >= 0) state.products[index].amount = amount;

      state.totalAmount = state.products.reduce(
        (prev, p) => prev + p.amount,
        0
      );
    },
  },
});

export const { setShop, setAmount } = shopSlice.actions;

export default shopSlice.reducer;
