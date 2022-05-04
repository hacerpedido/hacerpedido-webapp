import { combineReducers } from "redux"

import cartReducer from "./cartSlice"
import homeReducer from "./homeSlice"
import shopReducer from "./shopSlice"

export const rootReducer = combineReducers({
  cart: cartReducer,
  home: homeReducer,
  shop: shopReducer,
})
