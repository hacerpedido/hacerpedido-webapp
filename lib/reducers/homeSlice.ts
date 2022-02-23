import { createSlice } from "@reduxjs/toolkit";

import { IShop } from "../../types";

const initialState = {
  shops: [],
  selectedFilter: "Comida",
  firstVisibleItem: 0,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setFirstVisibleItem(state, { payload }) {
      state.firstVisibleItem = payload;
    },
    setCategory(state, { payload }) {
      state.firstVisibleItem = 0;
      state.selectedFilter = payload;
    },
    setShops(state, action) {
      const newShops = action.payload;
      state.shops = newShops.concat(
        // TODO: should use shop type
        state.shops.filter((bo: IShop) => {
          newShops.every((ao: IShop) => ao.id !== bo.id);
        })
      );
    },
  },
});

export const { setCategory, setFirstVisibleItem, setShops } = homeSlice.actions;

export default homeSlice.reducer;
