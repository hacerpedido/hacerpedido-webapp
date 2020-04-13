import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shops: [],
  loading: false,
  selectedFilter: "Comida",
};

const homeSlice = createSlice({
  name: "home",
  initialState: initialState,
  reducers: {
    setCategory(state, action) {
      state.selectedFilter = action.payload;
    },
    loading(state, action) {
      state.loading = action.payload;
    },
    query(state, action) {
      state.shops = action.payload;
      state.loading = false;
    },
  },
});

export const { setCategory, loading, query } = homeSlice.actions;

export default homeSlice.reducer;
