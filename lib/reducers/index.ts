// TODO: getDefaultMiddleware is deprecated
import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

import storage from "redux-persist/lib/storage";

import appReducer from "./appSlice";
import cartReducer from "./cartSlice";
import homeReducer from "./homeSlice";
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
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
