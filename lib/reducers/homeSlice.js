import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shops: [],
  selectedFilter: "Comida",
  firstVisibleItem: 0,
};

const homeSlice = createSlice({
  name: "home",
  initialState: initialState,
  reducers: {
    setFirstVisibleItem(state, { payload }) {
      state.firstVisibleItem = payload;
    },
    setCategory(state, { payload }) {
      state.firstVisibleItem = 0;
      state.selectedFilter = payload;
    },
    setShops(state, action) {
      state.shops = action.payload;
    },
  },
});

export const { setCategory, setFirstVisibleItem, setShops } = homeSlice.actions;

export default homeSlice.reducer;
