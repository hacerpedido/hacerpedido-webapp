import React, { useEffect, useReducer } from "react";
// import { Link } from "react-router-dom";
import { StyleSheet } from "react-native";
import API, { graphqlOperation } from "@aws-amplify/api";
import { Layout, Text, Spinner } from "@ui-kitten/components";

import HomeHeader from "./HomeHeader";
import ShopCard from "./ShopCard";
import { listShops } from "./graphql/queries";
// import { onCreateShop } from "./graphql/subscriptions";

// Action Types
const QUERY = "QUERY";
const LOADING = "LOADING";
// const SUBSCRIPTION = "SUBSCRIPTION";

const initialState = {
  shops: [],
  loading: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case LOADING:
      return { ...state, loading: action.loading };
    case QUERY:
      return { ...state, shops: action.shops, loading: false };
    // case SUBSCRIPTION:
    //   return { ...state, shops: [...state.shops, action.shop] };
    default:
      return state;
  }
};

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function getData() {
      const shopData = await API.graphql(
        graphqlOperation(listShops, {
          filter: { visibility: { eq: "public" } },
          limit: 10000
        })
      );
      dispatch({ type: QUERY, shops: shopData.data.listShops.items });
    }
    dispatch({ type: LOADING, loading: true });
    getData();

    // const subscription = API.graphql(graphqlOperation(onCreateShop)).subscribe({
    //   next: eventData => {
    //     const shop = eventData.value.data.onCreateShop;
    //     dispatch({ type: SUBSCRIPTION, shop });
    //   }
    // });

    // return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <HomeHeader />
      <Layout style={styles.container}>
        {(state.shops.length === 0) & state.loading ? (
          <Spinner size="giant" style={styles.spinner} />
        ) : (
          <>
            {state.shops.length > 0 ? (
              state.shops.map(shop => <ShopCard shop={shop} key={shop.id} />)
            ) : (
              <Text>Sin comercios en la base de datos</Text>
            )}
          </>
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
    padding: 16,
    backgroundColor: '#fafcff',
  }
});
