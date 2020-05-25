import React, {useLayoutEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {useParams} from "react-router-dom";
import {StyleSheet, Text, View} from "react-native";
import {Helmet} from "react-helmet-async";

import {useApolloClient} from "@apollo/react-hooks";
import ShopView from "./Shop";
import ShopFooter from "./ShopFooter";
import colors from "assets/colors";
import {loading} from "reducers/appSlice";
import {setShop} from "reducers/shopSlice";
import {getShopWithDetails} from "graphql/shop";
import Loading from "components/Loading";

export default () => {
  const dispatch = useDispatch();
  const client = useApolloClient();
  const isLoading = useSelector((state) => state.app.loading);
  const {name} = useSelector((state) => state.shop.shop);
  let {slug} = useParams();

  useLayoutEffect(() => {
    dispatch(loading(true));

    async function getData() {
      const shopData = await client.query({
        query: getShopWithDetails,
        variables: {slug},
      });
      dispatch(setShop(shopData.data.shopBySlug));
      dispatch(loading(false));
    }
    getData().catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  }, [slug, dispatch, client]);

  if (name === undefined) {
    return isLoading ? (
      <Loading />
    ) : (
        <Text>Sin comercios en la base de datos para {slug}</Text>
      );
  }

  return (
    <>
      <Helmet>
        <title>{name}</title>
        <meta
          property="og:image"
          content="https://comercios.hacerpedido.com/wp-content/uploads/2020/03/cropped-Favicon.png"
        />
        <meta property="og:description" content={name} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Hacer Pedido" />
        <meta property="og:title" content={name} />
        <meta
          property="og:url"
          content={"https://hacerpedido.com/" + slug}
        />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={name} />
        <meta property="twitter:description" content={name} />
        <meta
          property="twitter:url"
          content={"https://hacerpedido.com/" + slug}
        />
      </Helmet>

      <ShopView />
      {/* TODO: Quitar el view */}
      <View style={styles.footer}>
        <ShopFooter />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.lightBackground,
    bottom: 0,
    height: 100,
    position: "fixed",
    width: "100%",
  },
});
