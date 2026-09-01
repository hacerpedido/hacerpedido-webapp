// @ts-nocheck
import { CartProvider } from "#lib/context/CartContext";

import Head from "next/head";
import React from "react";

import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

function MyApp({ Component, pageProps }) {
  return (
    <CartProvider>
      <Head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta
          content="Pedí a tu comercio favorito por WhatsApp. Empezá a recibir pedidos de tus clientes hoy mismo, gratis."
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
        <link href="/logo192.png" rel="apple-touch-icon" />

        {/* <!-- OG: 2.7.6 --> */}
        <meta content="og_image.jpg" property="og:image" />
        <meta
          content="Pedí a tu comercio favorito por WhatsApp"
          property="og:description"
        />
        <meta content="article" property="og:type" />
        <meta content="Hacer Pedido" property="og:site_name" />
        <meta content="HacerPedido" property="og:title" />
        <meta content="https://hacerpedido.com/" property="og:url" />
        <meta content="summary" property="twitter:card" />
        <meta content="HacerPedido" property="twitter:title" />
        <meta content="HacerPedido" property="twitter:description" />
        <meta content="https://hacerpedido.com/" property="twitter:url" />
        {/* <!-- /OG --> */}
      </Head>
      <Component {...pageProps} />
    </CartProvider>
  );
}

export default MyApp;
