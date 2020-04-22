import React, { useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import API, { graphqlOperation } from "@aws-amplify/api";
import { StyleSheet, ScrollView, Text, View } from "react-native";
import { Helmet } from "react-helmet-async";

import { loading, query } from "./shopsSlice";
import { listShopsWithProducts } from "./graphql/queriesCustom";
import ShopHeader from "./ShopHeader";
import ShopNotes from "./ShopNotes";
import ShopFooter from "./ShopFooter";
import ProductList from "./ProductList";
import Loading from "./components/Loading";

export default function Shop() {
  const state = useSelector((state) => state); // TODO: limitar que parte del estado usar
  const dispatch = useDispatch();

  let { slug } = useParams();

  useLayoutEffect(() => {
    dispatch(loading(true));

    async function getData() {
      const shopData = await API.graphql(
        graphqlOperation(listShopsWithProducts, {
          filter: { slug: { eq: slug } },
          limit: 10000,
        })
      );
      // console.log("SLUG: " + slug);
      // console.log("ITEMS: " + shopData.data.listShops.items.length);
      let shops = shopData.data.listShops.items;
      dispatch(query(shops));
    }
    getData().catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  }, [slug, dispatch]);

  // Just in case
  const shop = state.shops.find((x) => x.slug === slug);

  if (shop === undefined) {
    return state.loading ? (
      <Loading />
    ) : (
      <Text>Sin comercios en la base de datos para {slug}</Text>
    );
  }

  let prods = [];

  // TODO: Mover a un modelo?
  if (shop.products !== undefined && shop.products.items !== undefined) {
    prods = [...shop.products.items].sort((a, b) =>
      a.itemNumber > b.itemNumber ? 1 : -1
    );
  }

  return (
    <>
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
      </Helmet>

      <ScrollView>
        <ShopHeader shop={shop} />
        <View style={styles.container}>
          {state.loading ? (
            <Loading />
          ) : (
            <>
              {prods.length === 0 ? (
                <View />
              ) : (
                <>
                  <ProductList products={prods} />
                  <ShopNotes shop={shop} />
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <ShopFooter shop={shop} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  spinner: {
    alignItems: "center",
  },
  container: {
    marginBottom: 130,
    backgroundColor: "#fff"
  },
  footer: {
    width: "100%",
    height: 100,
    backgroundColor: "#fafcff",
    position: "fixed",
    bottom: 0,
  },
});
