import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {Helmet, HelmetProvider} from "react-helmet-async";
import {PersistGate} from "redux-persist/integration/react";
import ApolloClient from "apollo-boost";
import {ApolloProvider} from "@apollo/react-hooks";

import './wdyr';
import * as serviceWorker from "./serviceWorker";
import App from "./app/App";
import {store, persistor} from "./reducers";

// import "react-datasheet/lib/react-datasheet.css";
import "index.css";

const client = new ApolloClient({
  uri: "https://backend-restapi.hacerpedido.com/graphql",
});

ReactDOM.render(
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
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
