import "bootstrap/dist/css/bootstrap.min.css"
import type { AppProps } from "next/app"
import Head from "next/head"
import { FC, useEffect } from "react"
import TagManager from "react-gtm-module"

import { CartProvider } from "react-use-cart"
// import CartProvider from "@/components/CartProvider"

import "@/styles/globals.css"

const CustomApp: FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    TagManager.initialize({ gtmId: "GTM-PKPPSFX" })
  }, [])

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Pedí a tu comercio favorito por WhatsApp. Empezá a recibir pedidos de tus clientes hoy mismo, gratis."
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />

        {/* <!-- OG: 2.7.6 --> */}
        <meta property="og:image" content="og_image.jpg" />
        <meta
          property="og:description"
          content="Pedí a tu comercio favorito por WhatsApp"
        />
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

      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </>
  )
}

export default CustomApp
