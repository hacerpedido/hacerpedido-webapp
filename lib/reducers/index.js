import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import appReducer from "./appSlice";
import cartReducer from "./cartSlice";
import homeReducer from "./homeSlice";
import newShopReducer from "./newShopSlice";
import shopEditReducer from "./shopEditSlice";
import shopReducer from "./shopSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["app", "shopEdit", "shop"],
};

const rootReducer = combineReducers({
  app: appReducer,
  cart: cartReducer,
  home: homeReducer,
  shop: shopReducer,
  shopEdit: shopEditReducer,
  newShop: newShopReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

export const persistor = persistStore(store);
