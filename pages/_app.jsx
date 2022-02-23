import "bootstrap/dist/css/bootstrap.min.css";
import Head from "next/head";
import { useEffect } from "react";
import TagManager from "react-gtm-module";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "../lib/reducers";

import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    TagManager.initialize({ gtmId: "GTM-PKPPSFX" });
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Pedí a tu comercio favorito por WhatsApp. Empezá a recibir pedidos de tus clientes hoy mismo, gratis."
          />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/logo192.png" />

          <script src="https://cdn.jsdelivr.net/npm/handsontable@8.2.0/dist/handsontable.full.min.js"></script>

          {/* <!-- OG: 2.7.6 --> */}
          <meta property="og:image" content="og_image.jpg" />
          <meta property="og:description" content="Pedí a tu comercio favorito por WhatsApp" />
          <meta property="og:type" content="article" />
          <meta property="og:site_name" content="Hacer Pedido" />
          <meta property="og:title" content="HacerPedido" />
          <meta property="og:url" content="https://hacerpedido.com/" />
          <meta property="twitter:card" content="summary" />
          <meta property="twitter:title" content="HacerPedido" />
          <meta property="twitter:description" content="HacerPedido" />
          <meta property="twitter:url" content="https://hacerpedido.com/" />
          {/* <!-- /OG --> */}
        </Head>
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
