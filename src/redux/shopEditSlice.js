import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shops: {},
};

const shopEditSlice = createSlice({
  name: "shopEdit",
  initialState: initialState,
  reducers: {
    setTempShop(state, action) {
      // console.log(state.shops);
      let shopId = action.payload.id.toString();
      if (state.shops === undefined) {
        state.shops = {};
      }
      state.shops[shopId] = action.payload.values;
    },
  },
});

export const { setTempShop } = shopEditSlice.actions;

export default shopEditSlice.reducer;
