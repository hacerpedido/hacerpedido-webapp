import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  shop: undefined
};

const shopSlice = createSlice({
  name: "shop",
  initialState: initialState,
  reducers: {
    setShop(state, { payload }) {
      state.shop = payload;
    },
    loading(state, { payload }) {
      state.loading = payload;
    },
  },
});

export const {
  setShop,
  loading,
} = shopSlice.actions;

export default shopSlice.reducer;
