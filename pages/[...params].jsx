import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { useApolloClient } from "@apollo/react-hooks";

import EditProductsForm from "../components/EditShop/EditProducts";
import EditShopForm from "../components/EditShop/EditShop";
import { loading } from "../lib/reducers/appSlice";
import ShopView from "../components/Shop/ShopView";
import Loading from "../components/Loading";
import Form from "../components/Form";
import MessageBox from "../components/MessageBox";
import theme from "../assets/theme";
import { trimObject } from "../lib/utils/utils";
import useWidth from "../lib/hooks/use_width";
import { getShopWithProductsByToken, saveShopWithProducts } from "../lib/api/shops";

// Para probar:
// http://localhost:3000/cfb6d51e87pfxuosysumcfb6d51vpka4/edit
// http://localhost:3000/test6grt3kg7w8x0w250yunjc6gru6f6/edit
// https://hacerpedido.com/test6grt3kg7w8x0w250yunjc6gru6f6/edit

export default function EditShopPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.app.loading);
  const [shop, setShop] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setSaving] = useState(false);
  const tempProducts = useSelector((state) => state.shopEdit.tempProducts);
  const client = useApolloClient();
  const width = useWidth();

  const [reloadCount, setReloadCount] = useState(0);

  let { params } = router.query;

  let token = typeof params !== "undefined" ? params[0] : undefined;

  useEffect(() => {
    dispatch(loading(true));
    setShop(null);

    async function getData() {
      try {
        const shopData = await getShopWithProductsByToken(token);
        setShop(shopData.data[0]);
      } catch (error) {
        alert(`Error al leer los datos. (${error} Error: ${error.response.data.message})`);
      } finally {
        dispatch(loading(false));
      }
    }
    getData();
  }, [token, dispatch, client, reloadCount]);

  const { handleSubmit, register, setValue, errors, control, watch, getValues } = useForm({
    mode: "onBlur",
  });

  if (!params) {
    return <Loading />;
  }

  // Sólo para las páginas de edit por ahora
  if (params[1] !== "edit") {
    return <ErrorPage statusCode={404} />;
  }

  const onSubmit = (data) => {
    trimObject(data);

    async function saveData() {
      setSaving(true);
      let dataToSave = {
        ...data,
        id: shop.id,
        slug: shop.slug,
        region: shop.region,
      };

      const result = await saveShopWithProducts(dataToSave, tempProducts);

      setMessage(result.message);

      if (result.error == null) {
        let editedShop = { ...shop, ...dataToSave };
        if (tempProducts != null) {
          editedShop.products = tempProducts;
        }
        setShop(editedShop);
      }

      setShowMessage(true);
      setSaving(false);
      setReloadCount(reloadCount + 1);
    }
    saveData();
  };

  function onMessagePress() {
    setShowMessage(!showMessage);
  }

  if (token == null) {
    return <Text>Error cargando el comercio.</Text>;
  }

  if (shop == null) {
    return isLoading ? <Loading /> : <Text>No hay un comercio en la base de datos para el token {token}</Text>;
  }

  const tempValues = watch();
  let tempShop = trimObject({ ...shop, ...tempValues });

  let products = shop?.products ?? [];
  let previewProducts = tempProducts ?? products;

  // const width = (typeof window !== "undefined" && window.innerWidth) || 0;

  const showPreview = width > 1000;

  const isError = Object.keys(errors).length > 0;

  const openProductionLink = {
    paddingBottom: 30,
    textAlign: "center",
    textDecoration: "none",
  };

  return (
    <>
      <Head>
        <title>{tempShop.name} | Hacer Pedido</title>
      </Head>

      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <Form {...{ register, setValue, errors, control }}>
            <EditShopForm
              shop={shop}
              control={control}
              errors={errors}
              handleSubmit={handleSubmit(onSubmit)}
              getValues={getValues}
              isSaving={isSaving}
            />
            <EditProductsForm products={products} shopId={shop.id} />
          </Form>
        </View>
        {showPreview && (
          <View style={styles.rightContainer}>
            <a href={`/${shop.slug}`} style={openProductionLink} rel="noopener noreferrer" target="_blank">
              <Text style={styles.openProductionLink}>
                Ir a mi Sitio
                <Image source={"/images/external-link-alt.png"} style={styles.openProductionLinkIcon} />
              </Text>
            </a>
            <ShopView previewProducts={previewProducts} shop={tempShop} isPreview={true} />
          </View>
        )}
      </View>

      {showMessage && (
        <MessageBox
          message={
            isError ? "Hubo errores en los datos que ingresaste. Por favor revisalos y grabá nuevamente." : message
          }
          isError={isError}
          onMessagePress={onMessagePress}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightGrey2,
    flexDirection: "row",
    height: "100vh",
  },
  leftContainer: {
    backgroundColor: theme.colors.lightBackground,
    flex: 1,
    overflowY: "scroll",
    padding: 40,
  },
  openProductionLink: {
    color: theme.colors.button1,
    fontFamily: "Barlow",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "600",
  },
  openProductionLinkIcon: {
    height: 16,
    margin: 3,
    top: 4,
    width: 18,
  },
  rightContainer: {
    backgroundColor: theme.colors.lightGrey2,
    padding: 30,
    width: 400,
  },
});
