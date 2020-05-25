import React, {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {useHistory} from "react-router-dom";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import {Helmet} from "react-helmet-async";
import {useApolloClient} from "@apollo/react-hooks";

import HomeHeader from "./HomeHeader";
import HomeFilterBar from "./HomeFilterBar";
import ShopCard from "./ShopCard";
import {loading} from "reducers/appSlice";
import {setCategory, query, setFirstVisibleItem} from "reducers/homeSlice";
import {setShop} from "reducers/shopSlice";
import {listShopsForHome} from "graphql/home";
import colors from "assets/colors";

let touchStartingPoint = 0;
let touchCurrentPoint = 0;

let firstVisibleItemIndex = 0;
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

const onViewableItemsChanged = ({viewableItems, changed}) => {
  if (viewableItems !== undefined && viewableItems.length > 0) {
    firstVisibleItemIndex = viewableItems[0].index;
  }
};

export default () => {
  const firstVisibleItem = useSelector(
    (state) => state.home.firstVisibleItem
  );
  const category = useSelector((state) => state.home.selectedFilter);
  const shops = useSelector((state) => state.home.shops);
  const dispatch = useDispatch();
  const history = useHistory();
  const client = useApolloClient();

  const onSelect = React.useCallback(
    (shop) => {
      let distance = Math.abs(touchStartingPoint - touchCurrentPoint);
      if (distance <= 10) {
        dispatch(setFirstVisibleItem(firstVisibleItemIndex));
        dispatch(setShop(shop));
        history.push(`/${shop.slug}`);
      }
    },
    [history, dispatch]
  );

  useEffect(() => {
    dispatch(loading(true));

    async function getData() {
      const shopData = await client.query({
        query: listShopsForHome,
        variables: {category},
      });
      let shops = shopData.data.allShops.nodes;
      dispatch(query(shops));
      dispatch(loading(false));
    }
    getData().catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  }, [dispatch, client, category]);

  let filteredShops = shops.filter(
    (x) => x.visibility === "public" && x.category === category
  );

  let initialScrollIndex = firstVisibleItem ?? 0;

  let title = "Pedí a tu comercio favorito por WhatsApp";

  return (
    <View>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <View style={styles.header}>
        <HomeHeader />
        <HomeFilterBar
          selectedFilter={category}
          onSelectFilter={(selected) => {
            firstVisibleItemIndex = 0;
            dispatch(setCategory(selected));
          }}
        />
      </View>
      <View style={styles.body}>
        {filteredShops.length === 0 && loading ? (
          <ActivityIndicator
            size="large"
            color={colors.orangeHp}
            style={styles.spinner}
          />
        ) : (
            <>
              {filteredShops.length > 0 && (
                <FlatList
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={{
                    itemVisiblePercentThreshold: 50,
                  }}
                  style={styles.list}
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={renderHeader(filteredShops.length)}
                  ListFooterComponent={
                    // TODO: Remover. Para que al hacer scroll se vea la última celda
                    <View style={styles.lastView} />
                  }
                  data={filteredShops}
                  renderItem={({item}) => (
                    <TouchableHighlight
                      delayPressIn={5000}
                      underlayColor={colors.lightBackground}
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
                        onSelect(item);
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
              )}
            </>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: colors.lightBackground,
    flex: 1,
    marginTop: 110,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  count: {
    color: colors.lightGrey,
    fontFamily: "Barlow",
    fontSize: 14,
    fontWeight: 400,
    marginVertical: 15,
  },
  header: {
    left: 0,
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 2,
  },
  lastView: {
    backgroundColor: colors.none,
    height: 250,
  },
  list: {
    height: "100vh",
  },
  spinner: {
    margin: 30,
  },
});
