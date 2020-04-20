import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Helmet, HelmetProvider } from "react-helmet-async";
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
import { PersistGate } from "redux-persist/integration/react";

import shopsReducer from "./shopsSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["shops", "loading", "homeFirstVisibleItem", "homeInitialOffset"],
};

const persistedReducer = persistReducer(persistConfig, shopsReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

let persistor = persistStore(store);

ReactDOM.render(
  // <React.StrictMode>
  <HelmetProvider>
    <Provider store={store}>
      <Helmet titleTemplate="%s | Hacer Pedido" defaultTitle="Hacer Pedido" />
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </HelmetProvider>,
  // </React.StrictMode>
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
