import { combineReducers, configureStore, getDefaultMiddleware, } from "@reduxjs/toolkit";
import {
  persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import appReducer from "./appSlice";
import cartReducer from "./cartSlice";
import homeReducer from "./homeSlice";
import shopReducer from "./shopSlice";
import shopEditReducer from "./shopEditSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["shops", "products", "loading", "firstVisibleItem", "shopEdit", "totalCartProducts"],
};

const rootReducer = combineReducers({
  app: appReducer,
  cart: cartReducer,
  home: homeReducer,
  shop: shopReducer,
  shopEdit: shopEditReducer,
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
