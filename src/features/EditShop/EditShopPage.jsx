import React, { useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { StyleSheet, ScrollView, Text, View } from "react-native";
import { Helmet } from "react-helmet-async";

import { loading, query } from "../../shopsSlice";
import { listShopsWithProducts } from "../../graphql/shop";
import ShopView from "../Shop/Shop";
import Loading from "../../components/Loading";
import { useApolloClient } from "@apollo/react-hooks";
import colors from "../../assets/colors";

export default () => {
  const isLoading = useSelector((state) => state.loading);
  const shops = useSelector((state) => state.shops);
  const dispatch = useDispatch();
  const client = useApolloClient();

  let { slug, token } = useParams();

  if (slug === undefined || token === undefined) {
    return <Text>Error cargando {slug} (1)</Text>;
  }

  // Para probar: http://localhost:3000/deguarda/edit/cfb6d51e87pfxuosysumcfb6d51vpka4
  // http://localhost:3000/test-4/edit/test6grt3kg7w8x0w250yunjc6gru6f6

  useLayoutEffect(() => {
    dispatch(loading(true));

    async function getData() {
      const shopData = await client.query({
        query: listShopsWithProducts,
        variables: {
          slug,
        },
      });
      let fetchedShops = shopData.data.allShops.nodes;
      dispatch(query(fetchedShops));
    }
    getData().catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  }, [slug, dispatch, client]);

  // Just in case
  const shop = shops.find((x) => x.slug === slug);

  if (shop === undefined) {
    return isLoading ? (
      <Loading />
    ) : (
      <Text>No hay un comercio en la base de datos para {slug}</Text>
    );
  }

  console.log(shop.typeformtoken)

  if (shop.typeformtoken !== token) {
    return <Text>Error cargando {slug} (2)</Text>;
  }

  let products = shop?.productsByShopid?.nodes ?? [];

  return (
    <>
      <Helmet>
        <title>{shop.name}</title>
        <meta
          property="og:image"
          content="https://comercios.hacerpedido.com/wp-content/uploads/2020/03/cropped-Favicon.png"
        />
        <meta property="og:description" content={shop.name} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Hacer Pedido" />
        <meta property="og:title" content={shop.name} />
        <meta
          property="og:url"
          content={"https://hacerpedido.com/" + shop.slug}
        />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={shop.name} />
        <meta property="twitter:description" content={shop.name} />
        <meta
          property="twitter:url"
          content={"https://hacerpedido.com/" + shop.slug}
        />
      </Helmet>

      <View style={styles.container}>
        <View style={styles.leftContainer}></View>
        <View style={styles.rightContainer}>
          <ShopView
            products={products}
            shop={shop}
            style={styles.shopContainer}
            isPreview={true}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
    flexDirection: "row",
    padding: 10,
    height: "100vh",
  },
  leftContainer: {
    backgroundColor: colors.lightBackground,
    flex: 1,
  },
  rightContainer: {
    backgroundColor: colors.black,
    padding: 10,
    width: 400,
  },
  shopContainer: {
    backgroundColor: colors.black,
    width: 375,
  },
});
