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
import {
  setCategory,
  loading,
  query,
  setHomeFirstVisibleItem,
} from "./shopsSlice";

let touchStartingPoint = 0;
let touchCurrentPoint = 0;

let firstVisibleItem = 0;
let ITEM_HEIGHT = 130;

const renderHeader = (count) => {
  let shopText = count > 0 || count === 0 ? "comercios" : "comercio";
  let countText = count === 0 ? "No hay" : count;

  return (
    <Text style={styles.count}>
      {countText} {shopText} locales
    </Text>
  );
};

const onViewableItemsChanged = ({ viewableItems, changed }) => {
  if (viewableItems !== undefined && viewableItems.length > 0) {
    firstVisibleItem = viewableItems[0].index;
  }
};

export default function Home() {
  const state = useSelector((state) => state); // TODO: limitar que se lee del store
  const dispatch = useDispatch();
  const history = useHistory();

  const onSelect = React.useCallback(
    (slug) => {
      let distance = Math.abs(touchStartingPoint - touchCurrentPoint);
      if (distance <= 10) {
        dispatch(setHomeFirstVisibleItem(firstVisibleItem));
        history.push("/" + slug);
      }
    },
    [history, dispatch]
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

  // TODO: mover a un modelo?
  let shops = state.shops.filter(
    (x) => x.visibility === "public" && x.category === state.selectedFilter
  );

  // TODO: mover a un modelo?
  shops = shops.sort((a, b) => (a.name > b.name ? 1 : -1));

  let initialScrollIndex = state.homeFirstVisibleItem ?? 0;

  return (
    <View>
      <Helmet>
        <title>Pedí a tu comercio favorito por WhatsApp</title>
      </Helmet>
      <View style={styles.header}>
        <HomeHeader />
        <HomeFilterBar
          selectedFilter={state.selectedFilter}
          onSelectFilter={(selected) => {
            firstVisibleItem = 0;
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
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{
                  itemVisiblePercentThreshold: 50,
                }}
                style={{ height: "100vh" }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader(shops.length)}
                ListFooterComponent={
                  // Para que al hacer scroll se vea la última celda
                  <View style={{ height: 250, backgroundColor: "none" }} />
                }
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
                initialScrollIndex={initialScrollIndex ?? 0}
                getItemLayout={(data, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index + 110,
                  index,
                })}
                scrollEventThrottle={160}
              />
            ) : (
              <Text></Text>
            )}
          </>
        )}
      </View>
    </View>
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
    flex: 1,
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
