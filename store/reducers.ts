import { combineReducers } from "redux"

import appReducer from "./appSlice"
import cartReducer from "./cartSlice"
import homeReducer from "./homeSlice"
import shopEditReducer from "./shopEditSlice"
import shopReducer from "./shopSlice"

export const rootReducer = combineReducers({
  app: appReducer,
  cart: cartReducer,
  home: homeReducer,
  shop: shopReducer,
  shopEdit: shopEditReducer,
})
