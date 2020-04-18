import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import API, { graphqlOperation } from "@aws-amplify/api";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { Helmet } from "react-helmet-async";

import HomeHeader from "./HomeHeader";
import HomeFilterBar from "./HomeFilterBar";
import ShopCard from "./ShopCard";
import { listShopsForHome } from "./graphql/queriesCustom";
import { setCategory, loading, query } from "./shopsSlice";

let touchStartingPoint = 0;
let touchCurrentPoint = 0;

const renderHeader = (count) => {
  let shopText = count > 0 || count === 0 ? "comercios" : "comercio";
  let countText = count === 0 ? "No hay" : count;

  return (
    <Text style={styles.count}>
      {countText} {shopText} locales
    </Text>
  );
};

export default function Home() {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const history = useHistory();

  const onSelect = React.useCallback(
    (slug) => {
      let distance = Math.abs(touchStartingPoint - touchCurrentPoint);
      if (distance <= 10) {
        history.push("/" + slug);
      }
    },
    [history]
  );

  useEffect(() => {
    dispatch(loading(true));

    async function getData() {
      const shopData = await API.graphql(
        graphqlOperation(listShopsForHome, {
          filter: {
            visibility: { eq: "public" },
            category: { eq: state.selectedFilter },
          },
          limit: 10000,
        })
      );
      const shops = shopData.data.listShops.items;
      dispatch(query(shops));
    }
    getData().catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  }, [state.selectedFilter, dispatch]);

  let shops = state.shops.filter(
    (x) => x.visibility === "public" && x.category === state.selectedFilter
  );

  shops = shops.sort((a, b) => (a.name > b.name ? 1 : -1));

  return (
    <>
      <Helmet>
        <title>Pedí a tu restaurant favorito por WhatsApp</title>
      </Helmet>
      <View style={styles.header}>
        <HomeHeader />
        <HomeFilterBar
          selectedFilter={state.selectedFilter}
          onSelectFilter={(selected) => {
            dispatch(setCategory(selected));
          }}
        />
      </View>
      <View style={styles.body}>
        {shops.length === 0 && state.loading ? (
          <ActivityIndicator
            size="large"
            color="#FFB233"
            style={{ margin: 30 }}
          />
        ) : (
          <>
            {shops.length > 0 ? (
              <FlatList
                ListHeaderComponent={renderHeader(shops.length)}
                data={shops}
                renderItem={({ item }) => (
                  <TouchableHighlight
                    delayPressIn={5000}
                    underlayColor={"#fafafa"}
                    onTouchStart={(evt) => {
                      if (evt.touches.length > 0) {
                        touchStartingPoint = evt.touches[0].clientY;
                        touchCurrentPoint = touchStartingPoint;
                      }
                    }}
                    onTouchMove={(evt) => {
                      if (evt.touches.length > 0) {
                        touchCurrentPoint = evt.touches[0].clientY;
                      }
                    }}
                    onPress={() => {
                      onSelect(item.slug);
                    }}
                  >
                    <ShopCard shop={item} />
                  </TouchableHighlight>
                )}
                keyExtractor={(shop) => shop.id}
              />
            ) : (
              <Text></Text>
            )}
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  spinner: {
    alignItems: "center",
  },
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 2,
  },
  body: {
    marginTop: 110,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    backgroundColor: "#fafafa",
  },
  count: {
    color: "#8F9BB3",
    marginVertical: 15,
    fontSize: 14,
    fontFamily: "Barlow",
    fontWeight: 400,
  },
});
