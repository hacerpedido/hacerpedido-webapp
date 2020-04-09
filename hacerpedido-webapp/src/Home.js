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
import HomeFilterBar from "./HomeFilterBar";
import ShopCard from "./ShopCard";
import { listShops } from "./graphql/queries";

const QUERY = "QUERY";
const LOADING = "LOADING";
const NEW_CATEGORY = "NEW_CATEGORY";

const initialState = {
  shops: [],
  loading: false,
  selectedFilter: "Comida",
};

const reducer = (state, action) => {
  switch (action.type) {
    case NEW_CATEGORY: 
      return {...state, selectedFilter: action.selectedFilter};
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
  const [state, dispatch] = useReducer(reducer, initialState);
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
    async function getData() {
      const shopData = await API.graphql(
        graphqlOperation(listShops, {
          filter: {
            visibility: { eq: "public" },
            category: { eq: state.selectedFilter },
          },
          limit: 10000,
        })
      );
      dispatch({ type: QUERY, shops: shopData.data.listShops.items });
    }
    dispatch({ type: LOADING, loading: true });
    getData();
  }, [state.selectedFilter]);

  return (
    <>
      <HomeHeader />
      <HomeFilterBar
        selectedFilter={state.selectedFilter}
        onSelectFilter={(selected) => {
          dispatch({ type: NEW_CATEGORY, selectedFilter: selected });

          // console.log(selected);
        }}
      />
      <View style={styles.container}>
        {(state.shops.length === 0) & state.loading ? (
          <ActivityIndicator size="large" color="#FFB233" />
        ) : (
          <>
            {state.shops.length > 0 ? (
              <FlatList
                ListHeaderComponent={renderHeader(state.shops.length)}
                data={state.shops}
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
