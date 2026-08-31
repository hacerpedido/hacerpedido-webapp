import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";

import Loading from "../components/Loading";
import ShopView from "../components/Shop/ShopView";
import ShopFooter from "../components/Shop/ShopFooter";
import { useCart } from "../lib/context/CartContext";
import styles from "./[slug].module.css";

export default function Shop() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { state, dispatch: cartDispatch } = useCart();
  const shop = state.shop;
  const { slug } = router.query;

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);

      try {
        const shopData = await axios.get(`${window.location.origin}/api/shop/${slug}`);
        cartDispatch({ type: "SET_SHOP", payload: shopData.data });
      } catch (error) {
        console.log(JSON.stringify(error, null, 2));
      } finally {
        setIsLoading(false);
      }
    };

    if (slug != null) {
      getData();
    }
  }, [cartDispatch, slug]);

  if (!slug || shop?.slug !== slug) {
    return isLoading ? <Loading /> : <p className={styles.message}>Sin comercios en la base de datos para {slug}.</p>;
  }

  if (!shop) {
    return <p className={styles.message}>Sin comercios en la base de datos para {slug}</p>;
  }

  return (
    <main className={styles.page}>
      <Head>
        <title>{shop.name} | Hacer Pedido</title>
        <meta property="og:image" content="/logo512.png" />
        <meta property="og:description" content={shop.name} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Hacer Pedido" />
        <meta property="og:title" content={shop.name} />
        <meta property="og:url" content={`https://hacerpedido.com/${shop.slug}`} />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={shop.name} />
        <meta property="twitter:description" content={shop.name} />
        <meta property="twitter:url" content={`https://hacerpedido.com/${shop.slug}`} />
      </Head>

      <ShopView shop={shop} isLoading={isLoading} />
      <ShopFooter shop={shop} />
    </main>
  );
}
