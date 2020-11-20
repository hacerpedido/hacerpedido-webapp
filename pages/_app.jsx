import * as React from "react";
import Head from "next/head";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import { store, persistor } from "../lib/reducers";

import '../styles/globals.css'

const client = new ApolloClient({
  uri: "https://backend-restapi.hacerpedido.com/graphql",
});

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        {/* <Helmet titleTemplate="%s | Hacer Pedido" defaultTitle="Hacer Pedido" /> */}
        <PersistGate loading={null} persistor={persistor}>
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          <Component {...pageProps} />
        </PersistGate>
      </Provider>
    </ApolloProvider>
  );
}

export default MyApp;
