import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  shops: [],
  selectedFilter: "Comida",
  firstVisibleItem: 0
};

const homeSlice = createSlice({
  name: "home",
  initialState: initialState,
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
  },
});

export const {
  setCategory,
  setFirstVisibleItem,
  query,
  loading,
} = homeSlice.actions;

export default homeSlice.reducer;
