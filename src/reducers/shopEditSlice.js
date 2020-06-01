import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shops: {},
};

const shopEditSlice = createSlice({
  name: "shopEdit",
  initialState: initialState,
  reducers: {
    setTempShop(state, action) {
      let shopId = action.payload.id.toString();
      if (state.shops === undefined) {
        state.shops = {};
      }
      state.shops[shopId] = action.payload.values;
    },
    saveTempShop(state, action) {
      let shopId = action.payload.id.toString();
      state.shops[shopId] = {};
    },
  },
});

export const { setTempShop, saveTempShop } = shopEditSlice.actions;

export default shopEditSlice.reducer;
