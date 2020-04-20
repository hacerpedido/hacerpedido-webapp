import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shops: [],
  loading: false,
  selectedFilter: "Comida",
  homeFirstVisibleItem: 0,
  homeInitialOffset: 0
};

const shopsSlice = createSlice({
  name: "shops",
  initialState: initialState,
  reducers: {
    setHomeInitialOffset(state, action) {
      state.homeInitialOffset = action.payload;
    },
    setHomeFirstVisibleItem(state, action) {
      state.homeFirstVisibleItem = action.payload;
    },
    setCategory(state, action) {
      state.homeInitialOffset = 0;
      state.homeFirstVisibleItem = 0;
      state.selectedFilter = action.payload;
    },
    loading(state, action) {
      state.loading = action.payload;
    },
    query(state, action) {

      // TODO: conservar los productos

      let newShops = action.payload;
      state.shops = newShops.concat(state.shops.filter(bo => newShops.every(ao => ao.id !== bo.id)));
      
      state.loading = false;
    },
  },
});

export const { setCategory, loading, query, setHomeFirstVisibleItem, setHomeInitialOffset } = shopsSlice.actions;

export default shopsSlice.reducer;
