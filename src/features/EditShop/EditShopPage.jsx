import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { StyleSheet, Text, View } from "react-native";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useApolloClient } from "@apollo/react-hooks";

import EditProductsForm from "./EditProducts";
import EditShopForm from "./EditShop";
import { loading } from "reducers/appSlice";
// import { setShop } from "reducers/shopSlice";
import { getShopWithDetails } from "graphql/shop";
import ShopView from "features/Shop/Shop";
import Loading from "components/Loading";
import Form from "components/Form";
import theme from "assets/theme";
import { saveShopWithProducts } from "api/shops";

// Para probar:
// http://localhost:3000/deguarda/edit/cfb6d51e87pfxuosysumcfb6d51vpka4
// http://localhost:3000/test-4/edit/test6grt3kg7w8x0w250yunjc6gru6f6
// https://hacerpedido.com/test-4/edit/test6grt3kg7w8x0w250yunjc6gru6f6

export default () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.app.loading);
  // const shop = useSelector((state) => state.shop.shop);
  const [shop, setShop] = useState(null);
  const tempProducts = useSelector((state) => state.shopEdit.tempProducts);
  const client = useApolloClient();

  let { slug, token } = useParams();

  // console.log(JSON.stringify(slug, null, 2));

  useEffect(() => {
    dispatch(loading(true));

    async function getData() {
      const shopData = await client.query({
        query: getShopWithDetails,
        variables: { slug },
      });
      setShop(shopData.data.shopBySlug);
      dispatch(loading(false));
    }
    getData().catch((error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  }, [slug, dispatch, client]);

  const onSubmit = (data) => {
    // console.log("onSubmit:" + JSON.stringify(data, null, 2));

    let dataToSave = {
      ...data,
      id: shop.id,
      slug: shop.slug,
      region: shop.region,
    };
    saveShopWithProducts(dataToSave, tempProducts);
    let editedShop = { ...shop, ...dataToSave };
    if (tempProducts != null) {
      editedShop.productsByShopid = { nodes: tempProducts };
    }
    setShop(editedShop);
  };

  // console.log(JSON.stringify(shop, null, 2));

  const { handleSubmit, register, setValue, errors, control, watch } = useForm({
    mode: "onBlur",
  });

  if (slug == null || token == null) {
    return <Text>Error cargando {slug} (1)</Text>;
  }

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

  const tempValues = watch();
  let tempShop = { ...shop, ...tempValues };

  let products = shop?.productsByShopid?.nodes ?? [];
  let previewProducts = tempProducts ?? products;

  // console.log("errors:", errors);

  return (
    <>
      <Helmet>
        <title>{tempShop.name}</title>
      </Helmet>

      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <Form {...{ register, setValue, errors, control }}>
            <EditShopForm
              shop={shop}
              control={control}
              errors={errors}
              handleSubmit={handleSubmit(onSubmit)}
            />
            <EditProductsForm products={products} shopId={shop.id} />
          </Form>
        </View>
        <View style={styles.rightContainer}>
          <ShopView
            previewProducts={previewProducts}
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
