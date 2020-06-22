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
import ShopView from "features/Shop/Shop";
import Loading from "components/Loading";
import Form from "components/Form";
import MessageBox from "components/MessageBox";
import theme from "assets/theme";
import { useWindowDimensions } from "components/WindowDimensionsProvider";
import { getShopWithProductsByToken, saveShopWithProducts } from "api/shops";

// Para probar:
// http://localhost:3000/cfb6d51e87pfxuosysumcfb6d51vpka4/edit
// http://localhost:3000/test6grt3kg7w8x0w250yunjc6gru6f6/edit
// https://hacerpedido.com/test6grt3kg7w8x0w250yunjc6gru6f6/edit

export default () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.app.loading);
  const [shop, setShop] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setError] = useState(false);
  const tempProducts = useSelector((state) => state.shopEdit.tempProducts);
  const client = useApolloClient();
  const { width } = useWindowDimensions();

  let { token } = useParams();

  // console.log(JSON.stringify(slug, null, 2));

  useEffect(() => {
    dispatch(loading(true));

    async function getData() {
      try {
        const shopData = await getShopWithProductsByToken(token);
        setShop(shopData.data[0]);
      } catch (error) {
        alert(
          `Error al leer los datos. (${error} Error: ${error.response.data.message})`
        );
      } finally {
        dispatch(loading(false));
      }
    }
    getData();
  }, [token, dispatch, client]);

  const onSubmit = (data) => {
    async function saveData() {
      let dataToSave = {
        ...data,
        id: shop.id,
        slug: shop.slug,
        region: shop.region,
      };

      const result = await saveShopWithProducts(dataToSave, tempProducts);

      setError(result.error != null);
      setMessage(result.message);

      if (result.error == null) {
        let editedShop = { ...shop, ...dataToSave };
        if (tempProducts != null) {
          editedShop.products = tempProducts;
        }
        setShop(editedShop);
      }
      setShowMessage(true);
    }
    saveData();
  };

  function onMessagePress() {
    setShowMessage(!showMessage);
  }

  const {
    handleSubmit,
    register,
    setValue,
    errors,
    control,
    watch,
    getValues,
  } = useForm({
    mode: "onBlur",
  });

  if (token == null) {
    return <Text>Error cargando el comercio.</Text>;
  }

  if (shop == null) {
    return isLoading ? (
      <Loading />
    ) : (
      <Text>No hay un comercio en la base de datos para el token {token}</Text>
    );
  }

  const tempValues = watch();
  let tempShop = { ...shop, ...tempValues };

  let products = shop?.products ?? [];
  let previewProducts = tempProducts ?? products;

  // console.log("errors:", errors);

  const showPreview = width > 1000;

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
              getValues={getValues}
            />
            <EditProductsForm products={products} shopId={shop.id} />
          </Form>
        </View>
        {showPreview && (
          <View style={styles.rightContainer}>
            <ShopView
              previewProducts={previewProducts}
              shop={tempShop}
              isPreview={true}
            />
          </View>
        )}
      </View>

      {showMessage && (
        <MessageBox
          message={message}
          isError={isError}
          onMessagePress={onMessagePress}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    flex: 1,
    flexDirection: "row",
    // height: "100vh",
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
