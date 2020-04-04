import React, { useEffect, useReducer } from "react";
import { Image } from "react-native";
import API, { graphqlOperation } from "@aws-amplify/api";
import { Layout, Text, Spinner } from "@ui-kitten/components";
import { StyleSheet } from "react-native";

// import { listShops } from "./graphql/queries";
import { listShopsWithProducts } from "./graphql/queriesCustom";
import { useParams } from "react-router-dom";

import ShopHeader from "./ShopHeader";

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

  const prods = shop.products.items;
  console.log(prods);

  return (
    <>
      <ShopHeader shop={shop} />
      <Layout style={styles.container}>
        {shop.logo ? <Image src="{shop.logo}" alt={shop.name + " logo"} /> : ""}
        {shop.address ? <Text>{shop.address}</Text> : ""}
        {shop.openTimes ? <Text>Pedidos: {shop.openTimes}</Text> : ""}
        {shop.deliveryCost ? <Text>Delivery: {shop.deliveryCost}</Text> : ""}

        {(prods.length === 0) & state.loading ? (
          <Spinner size="giant" />
        ) : (
          <ul>
            {prods.length > 0 ? (
              // prods.map(product => <li key={product.id}>{product.category} - {product.name} - {product.price}</li>)
              prods.map(product => <li key={product.id}>{product.name}</li>)
            ) : (
              <Text>Sin productos</Text>
            )}
          </ul>
        )}
      </Layout>
    </>
  );
}

const styles = StyleSheet.create({
  spinner: {
    alignItems: "center"
  },
  container: {
    padding: 16
    // flex: 1,
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    // flexWrap: "wrap"
  }
});
