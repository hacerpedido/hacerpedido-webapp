import React, { useEffect, useReducer } from "react";
import API, { graphqlOperation } from "@aws-amplify/api";
import {
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Helmet } from "react-helmet";

// import { listShops } from "./graphql/queries";
import { listShopsWithProducts } from "./graphql/queriesCustom";
import { useParams } from "react-router-dom";

import ShopHeader from "./ShopHeader";
import ShopNotes from "./ShopNotes";
import ShopFooter from "./ShopFooter";
import ProductList from "./ProductList";

// Action Types
const QUERY = "QUERY";
const LOADING = "LOADING";

const initialState = {
  shops: [],
  loading: false,
  products: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case LOADING:
      return { ...state, loading: action.loading };
    case QUERY:
      return { ...state, shops: action.shops, loading: false };
    default:
      return state;
  }
};

export default function Shop() {
  let { slug } = useParams();

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function getData() {
      const shopData = await API.graphql(
        graphqlOperation(listShopsWithProducts, {
          filter: { slug: { eq: slug } },
          limit: 10000,
        })
      );
      // console.log("SLUG: " + slug);
      // console.log("ITEMS: " + shopData.data.listShops.items.length);
      dispatch({ type: QUERY, shops: shopData.data.listShops.items });
    }
    dispatch({ type: LOADING, loading: true });
    getData();
  }, [slug]);

  if (state.shops.length === 0 && state.loading) {
    return <ActivityIndicator size="large" color="#FFB233" />;
  }

  if (state.shops.length === 0) {
    return <Text>Sin comercios en la base de datos para {slug}</Text>;
  }

  const shop = state.shops[0];

  /* 
<!-- OG: 2.7.6 -->
    <meta property="og:image" content="https://comercios.hacerpedido.com/wp-content/uploads/2020/03/cropped-Favicon.png"/>
    <meta property="og:description" content="WAI"/>
    <meta property="og:type" content="article"/>
    <meta property="og:site_name" content="Hacer Pedido"/>
    <meta property="og:title" content="WAI"/>
    <meta property="og:url" content="https://comercios.hacerpedido.com/wai/"/>
    <meta property="og:updated_time" content="2020-04-03T13:41:13+00:00"/>
    <meta property="article:published_time" content="2020-04-03T13:24:19+00:00"/>
    <meta property="article:modified_time" content="2020-04-03T13:41:13+00:00"/>
    <meta property="twitter:card" content="summary"/>
    <meta property="twitter:title" content="WAI"/>
    <meta property="twitter:description" content="WAI"/>
    <meta property="twitter:url" content="https://comercios.hacerpedido.com/wai/"/>
    <!-- /OG -->
  */

  const prods = shop.products.items.sort((a, b) =>
    a.itemNumber > b.itemNumber ? 1 : -1
  );
  // console.log(prods);

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
        {/* <meta property="og:updated_time" content="2020-04-03T13:41:13+00:00" />
        <meta
          property="article:published_time"
          content="2020-04-03T13:24:19+00:00"
        />
        <meta
          property="article:modified_time"
          content="2020-04-03T13:41:13+00:00"
        /> */}
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
            <Text>Cargando...</Text>
          ) : (
            <>
              {prods.length === 0 ? (
                <Text>Sin productos</Text>
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
  },
  footer: {
    width: "100%",
    height: 100,
    backgroundColor: "#fafcff",
    position: "fixed",
    bottom: 0,
  },
});
