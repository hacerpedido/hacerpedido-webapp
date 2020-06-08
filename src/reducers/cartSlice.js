import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  totalAmount: 0,
  takeaway: false,
  name: "",
  address: "",
  notes: ""
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    toggleTakeaway(state, { payload }) {
      state.takeAway = payload;
    },
    resetCart(state) {
      state.products = initialState.products
      state.totalAmount = initialState.totalAmount
    },
    updateProductAmount(state, { payload }) {
      const {product, amount} = payload
      const index = state.products.findIndex(p => p.id === product.id)

      if (index !== -1) {
        if(amount > 0) {
          state.products[index] = { ...product, amount }
        } else {
          delete state.products.splice(index, 1)
        }
      } else {
        state.products.push({ ...product, amount })
      }

      state.totalAmount = state.products.reduce((prev, p) => {
        return prev + (p.amount)
      }, 0 )
    }
  },
});

export const { toggleTakeaway, resetCart, updateProductAmount } = cartSlice.actions;

export default cartSlice.reducer;
