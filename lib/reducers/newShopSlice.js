import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: null,
  shopName: null,
  category: null,
};

const appSlice = createSlice({
  name: "newShop",
  initialState,
  reducers: {
    setField(state, { payload }) {
      state[payload.field] = payload.data;
      console.log(state);
    },
  },
});

export const { setField } = appSlice.actions;

export default appSlice.reducer;
