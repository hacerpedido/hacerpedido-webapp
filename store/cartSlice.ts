import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type SliceState = {
  name: string
  address: string
  notes: string
}

const initialState: SliceState = {
  name: "",
  address: "",
  notes: "",
}

const appSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setName(state, { payload }: PayloadAction<string>) {
      state.name = payload
    },
    setAddress(state, { payload }: PayloadAction<string>) {
      state.address = payload
    },
    setNotes(state, { payload }: PayloadAction<string>) {
      state.notes = payload
    },
  },
})

export const { setName, setAddress, setNotes } = appSlice.actions

export default appSlice.reducer
