import React, { useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { StyleSheet, Text, View } from "react-native";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useApolloClient } from "@apollo/react-hooks";

import EditProductsForm from "./EditProducts";
import EditShopForm from "./EditShop";
import validation from "./validation";
import { setShop } from "reducers/shopSlice";
import { getShopWithDetails } from "graphql/shop";
import ShopView from "features/Shop/Shop";
import Loading from "components/Loading";
import Form from "components/Form";
import theme from "assets/theme";
import { saveShop } from "api/shops";

export default () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.app.loading);
  const shop = useSelector((state) => state.shop.shop);
  const client = useApolloClient();

  let { slug, token } = useParams();

  if (!isLoading && (slug === undefined || token === undefined)) {
    return <Text>Error cargando {slug} (1)</Text>;
  }

  // Para probar:
  // http://localhost:3000/deguarda/edit/cfb6d51e87pfxuosysumcfb6d51vpka4
  // http://localhost:3000/test-4/edit/test6grt3kg7w8x0w250yunjc6gru6f6

  useLayoutEffect(() => {
    // dispatch(loading(true));

    async function getData() {
      const shopData = await client.query({
        query: getShopWithDetails,
        variables: { slug },
      });
      dispatch(setShop(shopData.data.shopBySlug));
      // dispatch(loading(false));
    }
    getData().catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  }, [slug, dispatch, client]);

  const onSubmit = (data) => {
    let dataToSave = {
      ...data,
      id: shop.id,
      slug: shop.slug,
      region: shop.region,
    };

    // console.log("dataToSave:", dataToSave);
    saveShop(dataToSave);

    let editedShop = { ...shop, ...dataToSave };
    dispatch(setShop(editedShop));
  };

  if (shop == null) {
    return isLoading ? (
      <Loading />
    ) : (
      <Text>No hay un comercio en la base de datos para {slug}</Text>
    );
  }

  if (shop.typeformtoken !== token) {
    return <Text>Error cargando {slug} (2)</Text>;
  }

  const { handleSubmit, register, setValue, errors, control, watch } = useForm({
    mode: "onBlur",
    defaultValues: {
      ...shop,
    },
  });

  const tempValues = watch();
  let tempShop = { ...shop, ...tempValues };
  // console.log('', tempShop);

  let products = shop?.productsByShopid?.nodes ?? [];
  // let sections = extractSections(products);

  let tempProducts = products;

  return (
    <>
      <Helmet>
        <title>{tempShop.name}</title>
      </Helmet>

      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <Form {...{ register, validation, setValue, errors, control }}>
            <EditShopForm
              control={control}
              handleSubmit={handleSubmit(onSubmit)}
            />
            <EditProductsForm products={products} shopId={shop.id} />
          </Form>
        </View>
        <View style={styles.rightContainer}>
          <ShopView
            previewProducts={tempProducts}
            shop={tempShop}
            isPreview={true}
          />
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
    // height: "100vh",
    minWidth: 1000,
  },
  leftContainer: {
    backgroundColor: theme.colors.lightBackground,
    flex: 1,
    padding: 10,
  },
  rightContainer: {
    backgroundColor: theme.colors.lightGrey2,
    padding: 30,
    width: 400,
  },
});
