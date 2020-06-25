import {createSlice} from "@reduxjs/toolkit";

const initialState = {
  loading: true
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    loading(state, {payload}) {
      state.loading = payload;
    }
  },
});

export const {loading} = appSlice.actions;

export default appSlice.reducer;
