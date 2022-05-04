import { combineReducers } from "redux"

import shopReducer from "./shopSlice"

export const rootReducer = combineReducers({
  shop: shopReducer,
})
