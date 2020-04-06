import React, { useEffect, useReducer,  } from "react";
import API, { graphqlOperation } from "@aws-amplify/api";
import { Layout, Text, Spinner } from "@ui-kitten/components";
import { StyleSheet, ScrollView } from "react-native";

// import { listShops } from "./graphql/queries";
import { listShopsWithProducts } from "./graphql/queriesCustom";
import { useParams } from "react-router-dom";

import ShopHeader from "./ShopHeader";
import ShopFooter from "./ShopFooter";
import ProductList from "./ProductList";

// Action Types
const QUERY = "QUERY";
const LOADING = "LOADING";

const initialState = {
  shops: [],
  loading: false,
  products: []
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
          limit: 10000
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
    return <Spinner size="giant" />;
  }

  if (state.shops.length === 0) {
    return <Text>Sin comercios en la base de datos para {slug}</Text>;
  }

  const shop = state.shops[0];

  const prods = shop.products.items.sort((a, b) =>
    a.itemNumber > b.itemNumber ? 1 : -1
  );
  // console.log(prods);

  return (
    <>
      <ScrollView>
        <ShopHeader shop={shop} />
        <Layout style={styles.container}>
          {state.loading ? (
            <Spinner size="giant" />
          ) : (
            <>
              {prods.length === 0 ? (
                <Text>Sin productos</Text>
              ) : (
                <ProductList products={prods} />
              )}
            </>
          )}
        </Layout>
      </ScrollView>
      <Layout style={styles.footer}>
        <ShopFooter shop={shop} />
      </Layout>
    </>
  );
}

const styles = StyleSheet.create({
  spinner: {
    alignItems: "center"
  },
  container: {
    marginBottom: 130,
  },
  footer: {
    width: "100%",
    height: 100,
    backgroundColor: "#fafcff",
    position: "fixed",
    bottom: 0
  }
});
