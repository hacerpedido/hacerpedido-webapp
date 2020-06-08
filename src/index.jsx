import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {Helmet, HelmetProvider} from "react-helmet-async";
import {PersistGate} from "redux-persist/integration/react";
import ApolloClient from "apollo-boost";
import {ApolloProvider} from "@apollo/react-hooks";
import * as Sentry from "@sentry/browser";
import * as serviceWorker from "./serviceWorker";
import App from "./app/App";
import {store, persistor} from "./reducers";
// import "react-datasheet/lib/react-datasheet.css";
import "index.css";

Sentry.init({dsn: process.env.HP_SENTRY_DSN});

const client = new ApolloClient({
  uri: "https://backend-restapi.hacerpedido.com/graphql",
});

ReactDOM.render(
  // <React.StrictMode>
  <ApolloProvider client={client}>
    <HelmetProvider>
      <Provider store={store}>
        <Helmet titleTemplate="%s | Hacer Pedido" defaultTitle="Hacer Pedido" />
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </HelmetProvider>
  </ApolloProvider>,
  // </React.StrictMode>
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
