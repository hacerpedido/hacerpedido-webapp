import React, { useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { useParams } from "react-router-dom";
import { StyleSheet, Text, View } from "react-native";
// import { Helmet } from "react-helmet-async";
import { useRouter } from "next/router";

import { useApolloClient } from "@apollo/react-hooks";
import ShopView from "../components/Shop/Shop";
import ShopFooter from "../components/Shop/ShopFooter";
import { loading } from "../lib/reducers/appSlice";
import { setShop } from "../lib/reducers/shopSlice";
import { getShopWithDetails } from "../lib/graphql/shop";
import Loading from "../components/Loading";

export default function Shop() {
  const router = useRouter();

  const dispatch = useDispatch();
  const client = useApolloClient();
  const { slug } = router.query;
  const isLoading = useSelector((state) => state.app.loading);
  const shop = useSelector((state) => state.shop.shop);

  useLayoutEffect(() => {
    const getData = async () => {
      dispatch(loading(true));

      try {
        const shopData = await client.query({
          query: getShopWithDetails,
          variables: { slug },
        });

        dispatch(setShop(shopData.data.shopBySlug));
      } catch (error) {
        console.log(JSON.stringify(error, null, 2));
      } finally {
        dispatch(loading(false));
      }
    };

    getData();
  }, [client, dispatch, shop, slug]);

  if (shop?.slug !== slug) {
    return isLoading ? (
      <Loading />
    ) : (
      <Text>Sin comercios en la base de datos para {slug}</Text>
    );
  }

  return (
    <View style={styles.container}>
      {/*
      FIXME: next
      <Helmet>
        <title>{shop.name}</title>
        <meta
          property="og:image"
          content="https://comercios.hacerpedido.com/wp-content/uploads/2020/03/cropped-Favicon.png"
        />
        <meta property="og:description" content={shop.name} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Hacer Pedido" />
        <meta property="og:title" content={shop.name} />
        <meta
          property="og:url"
          content={"https://hacerpedido.com/" + shop.slug}
        />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={shop.name} />
        <meta property="twitter:description" content={shop.name} />
        <meta
          property="twitter:url"
          content={"https://hacerpedido.com/" + shop.slug}
        />
      </Helmet> */}

      <ShopView shop={shop} />

      <ShopFooter shop={shop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    // width: '100%',
  },
});
