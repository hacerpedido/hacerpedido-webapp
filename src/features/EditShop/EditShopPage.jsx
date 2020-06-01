import React, { useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { StyleSheet, Text, View } from "react-native";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";

import { setShop } from "../../reducers/shopSlice";
import { loading } from "../../reducers/appSlice";
import { getShopWithDetails } from "../../graphql/shop";
import ShopView from "../Shop/Shop";
import Loading from "../../components/Loading";
import { useApolloClient } from "@apollo/react-hooks";
import theme from "assets/theme";
import EditProductsForm from "./EditProducts";
import EditShopForm from "./EditShop";
import validation from "./validation";
import { extractSections } from "utils/products";

export default () => {
  const isLoading = useSelector((state) => state.app.loading);
  const editedShops = useSelector((state) => state.shopEdit.shops);
  const shop = useSelector((state) => state.shop.shop);
  const dispatch = useDispatch();
  const client = useApolloClient();

  let { slug, token } = useParams();

  if (!isLoading && slug === undefined || token === undefined) {
    return <Text>Error cargando {slug} (1)</Text>;
  }

  // Para probar:
  // http://localhost:3000/deguarda/edit/cfb6d51e87pfxuosysumcfb6d51vpka4
  // http://localhost:3000/test-4/edit/test6grt3kg7w8x0w250yunjc6gru6f6

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

  if (shop === undefined) {
    return isLoading ? (
      <Loading />
    ) : (
      <Text>No hay un comercio en la base de datos para {slug}</Text>
    );
  }

  if (shop.typeformtoken !== token) {
    return <Text>Error cargando {slug} (2)</Text>;
  }

  const editedShop = editedShops ? editedShops[shop.id] : {};

  let tempShop = { ...shop, ...editedShop };

  let products = shop?.productsByShopid?.nodes ?? [];

  let sections = extractSections(products);

  const { handleSubmit, register, setValue, errors, control, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      ...tempShop,
    },
  });

  return (
    <>
      <Helmet>
        <title>{tempShop.name}</title>
      </Helmet>

      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <Form {...{ register, validation, setValue, errors, control }}>
            <EditShopForm
              shop={tempShop}
              watch={watch}
              control={control}
              handleSubmit={handleSubmit}
            />
            <EditProductsForm
              shopId={shop.id}
              sections={sections}
              // control={control}
            />
          </Form>
        </View>
        <View style={styles.rightContainer}>
          <ShopView products={products} shop={tempShop} isPreview={true} />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    flex: 1,
    flexDirection: "row",
    height: "100vh",
    minWidth: 1000,
  },
  leftContainer: {
    backgroundColor: theme.colors.lightBackground,
    flexDirection: "column",
    flex: 1,
    padding: 10,
  },
  rightContainer: {
    backgroundColor: theme.colors.lightGrey2,
    padding: 30,
    width: 400,
  },
});
