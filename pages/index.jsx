import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { FlatList, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";

import colors from "../assets/colors";
import HomeFilterBar from "../components/Home/HomeFilterBar";
import HomeHeader from "../components/Home/HomeHeader";
import ShopCard from "../components/Home/ShopCard";
import Loading from "../components/Loading";
import { loading } from "../lib/reducers/appSlice";
import { setCategory, setShops, setFirstVisibleItem } from "../lib/reducers/homeSlice";
import { setShop } from "../lib/reducers/shopSlice";

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

const onViewableItemsChanged = ({ viewableItems }) => {
  if (viewableItems !== undefined && viewableItems.length > 0) {
    firstVisibleItemIndex = viewableItems[0].index;
  }
};

export default function App() {
  const firstVisibleItem = useSelector((state) => state.home.firstVisibleItem);
  const category = useSelector((state) => state.home.selectedFilter);
  const shops = useSelector((state) => state.home.shops);
  const dispatch = useDispatch();
  const router = useRouter();

  let initialScrollIndex = firstVisibleItem ?? 0;

  const onSelect = useCallback(
    (shop) => {
      let distance = Math.abs(touchStartingPoint - touchCurrentPoint);
      if (distance <= 10) {
        dispatch(setFirstVisibleItem(firstVisibleItemIndex));
        dispatch(setShop(shop));
        router.push(`/${shop.slug}`);
      }
    },
    [router, dispatch]
  );

  useEffect(() => {
    dispatch(loading(true));

    async function getData() {
      const shopData = await axios.get(`${window.location.origin}/api/shop/home`, { params: { category } });

      // console.log(JSON.stringify(shopData, null, 2));

      dispatch(setShops(shopData.data));
      dispatch(loading(false));
    }
    getData().catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  }, [dispatch, category]);

  let filteredShops = shops.filter((x) => x.visibility === "public" && x.category === category);

  const ShopList = () => (
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
      renderItem={({ item }) => (
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
          onPress={() => onSelect(item)}
        >
          <ShopCard shop={item} />
        </TouchableHighlight>
      )}
      keyExtractor={(shop) => shop.id}
      initialScrollIndex={initialScrollIndex ?? 0}
      getItemLayout={(_data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index + 110,
        index,
      })}
      scrollEventThrottle={160}
    />
  );

  return (
    <View>
      <Head>
        <title>Hacer Pedido | Pedí a tu comercio favorito por WhatsApp.</title>
      </Head>

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
        {filteredShops.length === 0 && loading ? <Loading /> : filteredShops.length && <ShopList />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: colors.homeBackground,
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
});
