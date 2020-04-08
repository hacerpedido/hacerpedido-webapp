import React, { useEffect, useReducer } from "react";
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

import HomeHeader from "./HomeHeader";
import ShopCard from "./ShopCard";
import { listShops } from "./graphql/queries";

const QUERY = "QUERY";
const LOADING = "LOADING";

const initialState = {
  shops: [],
  loading: false,
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

let touchStartingPoint = 0;
let touchCurrentPoint = 0;

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [selected, setSelected] = React.useState(new Map());
  const history = useHistory();

  const onSelect = React.useCallback(
    (slug) => {
      // const newSelected = new Map(selected);
      // newSelected.set(slug, !selected.get(slug));

      // setSelected(newSelected);

      let distance = Math.abs(touchStartingPoint - touchCurrentPoint);

      // console.log("TAPPED: " + slug);
      // console.log("DISTANCE: " + distance);

      if (distance <= 10) {
        // console.log("SIPI: " + distance);
        history.push("/" + slug);
        // } else {
        // console.log("NOPE: " + distance);
      }
    },
    [history] // [selected]
  );

  useEffect(() => {
    async function getData() {
      const shopData = await API.graphql(
        graphqlOperation(listShops, {
          filter: { visibility: { eq: "public" } },
          limit: 10000,
        })
      );
      dispatch({ type: QUERY, shops: shopData.data.listShops.items });
    }
    dispatch({ type: LOADING, loading: true });
    getData();
  }, []);

  return (
    <>
      <HomeHeader />
      <View style={styles.container}>
        {(state.shops.length === 0) & state.loading ? (
          <ActivityIndicator size="large" color="#FFB233" />
        ) : (
          <>
            {state.shops.length > 0 ? (
              <FlatList
                data={state.shops}
                renderItem={({ item }) => (
                  <TouchableHighlight
                    delayPressIn={5000}
                    underlayColor={"#fafafa"}
                    onTouchStart={(evt) => {
                      // console.log("START CELL:" + evt.touches[0].clientY);
                      if (evt.touches.length > 0) {
                        touchStartingPoint = evt.touches[0].clientY;
                        touchCurrentPoint = touchStartingPoint;
                      }
                    }}
                    onTouchMove={(evt) => {
                      // console.log("MOVED CELL:" + evt.touches[0].clientY);
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
                // extraData={selected}
              />
            ) : (
              <Text>Sin comercios en la base de datos aún.</Text>
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
  container: {
    padding: 10,
    backgroundColor: "#fafafa",
  },
});
