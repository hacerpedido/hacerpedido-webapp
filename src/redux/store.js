import {
  combineReducers,
  configureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import shopsReducer from "./shopsSlice";
import shopEditReducer from "./shopEditSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["shops", "loading", "homeFirstVisibleItem", "homeInitialOffset"], // TODO: ver como limitar
};

const rootReducer = combineReducers({
  website: shopsReducer,
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
