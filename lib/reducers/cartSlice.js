import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: null,
  address: null,
  notes: null,
};

const appSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setName(state, { payload }) {
      state.name = payload;
    },
    setAddress(state, { payload }) {
      state.address = payload;
    },
    setNotes(state, { payload }) {
      state.notes = payload;
    },
  },
});

export const { setName, setAddress, setNotes } = appSlice.actions;

export default appSlice.reducer;
