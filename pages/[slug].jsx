import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import Loading from "../components/Loading";
import ShopFooter from "../components/Shop/ShopFooter";
import ShopView from "../components/Shop/ShopView";
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
        const shopData = await axios.get(
          `${window.location.origin}/api/shop/${slug}`,
        );
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
    return isLoading ? (
      <Loading />
    ) : (
      <p className={styles.message}>
        Sin comercios en la base de datos para {slug}.
      </p>
    );
  }

  if (!shop) {
    return (
      <p className={styles.message}>
        Sin comercios en la base de datos para {slug}
      </p>
    );
  }

  return (
    <main className={styles.page}>
      <Head>
        <title>{shop.name} | Hacer Pedido</title>
        <meta content="/logo512.png" property="og:image" />
        <meta content={shop.name} property="og:description" />
        <meta content="article" property="og:type" />
        <meta content="Hacer Pedido" property="og:site_name" />
        <meta content={shop.name} property="og:title" />
        <meta
          content={`https://hacerpedido.com/${shop.slug}`}
          property="og:url"
        />
        <meta content="summary" property="twitter:card" />
        <meta content={shop.name} property="twitter:title" />
        <meta content={shop.name} property="twitter:description" />
        <meta
          content={`https://hacerpedido.com/${shop.slug}`}
          property="twitter:url"
        />
      </Head>

      <ShopView isLoading={isLoading} shop={shop} />
      <ShopFooter shop={shop} />
    </main>
  );
}
