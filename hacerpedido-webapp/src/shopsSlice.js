import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shops: [],
  loading: false,
  selectedFilter: "Comida",
  homeFirstVisibleItem: 0,  // TODO: Quitar de acá, mover a state.home
};

const shopsSlice = createSlice({
  name: "shops",
  initialState: initialState,
  reducers: {
    setHomeFirstVisibleItem(state, action) {
      state.homeFirstVisibleItem = action.payload;
    },
    setCategory(state, action) {
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

export const { setCategory, loading, query, setHomeFirstVisibleItem } = shopsSlice.actions;

export default shopsSlice.reducer;
