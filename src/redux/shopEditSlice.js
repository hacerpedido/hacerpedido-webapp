import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shop: undefined,
  isDirty: false,
};

const shopEditSlice = createSlice({
  name: "shopEdit",
  initialState: initialState,
  reducers: {
    setTempShop(state, action) {
      state.shop = action.payload;
    },
    setDirty(state, action) {
      state.isDirty = action.payload;
    },
  },
});

export const { setTempShop, setDirty } = shopEditSlice.actions;

export default shopEditSlice.reducer;
