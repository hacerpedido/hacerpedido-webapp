import React, { useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { StyleSheet, ScrollView, Text, View } from "react-native";
import { Helmet } from "react-helmet-async";

import { loading, query } from "../../shopsSlice";
import { listShopsWithProducts } from "../../graphql/shop";
import ShopHeader from "./ShopHeader";
import ShopNotes from "./ShopNotes";
import ShopFooter from "./ShopFooter";
import ProductList from "./ProductList";
import Loading from "../../components/Loading";
import { useApolloClient } from "@apollo/react-hooks";

// TODO: Dividir en Shop y ShopPage
export default () => {
  const state = useSelector((state) => state); // TODO: limitar que parte del estado usar
  const dispatch = useDispatch();
  const client = useApolloClient();

  let { slug } = useParams();

  useLayoutEffect(() => {
    dispatch(loading(true));

    async function getData() {
      const shopData = await client.query({
        query: listShopsWithProducts,
        variables: {
          slug,
        },
      });
      let shops = shopData.data.allShops.nodes;
      dispatch(query(shops));
    }
    getData().catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  }, [slug, dispatch, client]);

  // Just in case
  const shop = state.shops.find((x) => x.slug === slug);

  if (shop === undefined) {
    return state.loading ? (
      <Loading />
    ) : (
      <Text>Sin comercios en la base de datos para {slug}</Text>
    );
  }

  let prods = shop?.productsByShopid?.nodes ?? [];

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
              {prods.length > 0 && (
                <>
                  <ProductList products={prods} />
                  <ShopNotes shop={shop} />
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
      {/* TODO: Quitar el view */}
      <View style={styles.footer}>
        <ShopFooter shop={shop} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginBottom: 130,
  },
  footer: {
    backgroundColor: "#fafcff",
    bottom: 0,
    height: 100,
    position: "fixed",
    width: "100%",
  },
  spinner: {
    alignItems: "center",
  },
});
