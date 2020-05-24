import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: true,
  shops: [],
  selectedFilter: "Comida",
  firstVisibleItem: 0
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setFirstVisibleItem(state, {payload}) {
      state.firstVisibleItem = payload;
    },
    setCategory(state, {payload}) {
      state.firstVisibleItem = 0;
      state.selectedFilter = payload;
    },
    loading(state, {payload}) {
      state.loading = payload;
    },
    query(state, action) {	
      let newShops = action.payload;	
      state.shops = newShops.concat(	
        state.shops.filter((bo) => newShops.every((ao) => ao.id !== bo.id))	
      );	
    },
  },
});

export const {
  setCategory,
  setFirstVisibleItem,
  query,
  loading,
} = homeSlice.actions;

export default homeSlice.reducer;
