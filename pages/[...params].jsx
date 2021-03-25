import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Head from "next/head";
import { useForm } from "react-hook-form";
// import { useApolloClient } from "@apollo/react-hooks";
import axios from "axios";

import EditProductsForm from "../components/EditShop/EditProducts";
import EditShopForm from "../components/EditShop/EditShop";
import ShopView from "../components/Shop/ShopView";
import Loading from "../components/Loading";
import Form from "../components/Form";
import MessageBox from "../components/MessageBox";
import theme from "../assets/theme";
import { trimObject } from "../lib/utils/utils";
import useWidth from "../lib/hooks/use_width";
import { saveShopWithProducts } from "../lib/api/shops";

// Para probar:
// http://localhost:3000/cfb6d51e87pfxuosysumcfb6d51vpka4/edit
// http://localhost:3000/test6grt3kg7w8x0w250yunjc6gru6f6/edit
// https://hacerpedido.com/test6grt3kg7w8x0w250yunjc6gru6f6/edit

export default function EditShopPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  // const client = useApolloClient();
  const resizedWidth = useWidth();

  const [shopState, setShopState] = useState({ shop: null, loading: true });

  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setSaving] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  const tempProducts = useSelector((state) => state.shopEdit.tempProducts);

  let { params } = router.query;

  let token = typeof params !== "undefined" ? params[0] : undefined;

  // let a = { params, token, shop: shopState.shop, resizedWidth, loading: shopState.loading };
  // console.log("PASS: ", a);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (shopState.shop !== null || !shopState.loading) {
      setShopState({ shop: null, loading: true });
    }

    async function getData() {
      try {
        const shopData = await axios.get(`${window.location.origin}/api/shop/by-token`, { params: { token } });

        setShopState({ shop: shopData.data, loading: false });
      } catch (error) {
        alert(`Error al leer los datos. (${error} Error: ${error.response.data.message})`);
        setShopState({ shop: null, loading: false });
      }
    }
    getData();
  }, [token, dispatch, reloadCount]);

  const { handleSubmit, register, setValue, errors, control, watch, getValues } = useForm({
    mode: "onBlur",
  });

  if (!params || shopState.loading) {
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
        id: shopState.shop.id,
        slug: shopState.shop.slug,
        region: shopState.shop.region,
      };

      const result = await saveShopWithProducts(dataToSave, tempProducts);

      setMessage(result.message);

      if (result.error == null) {
        let editedShop = { ...shopState.shop, ...dataToSave };
        if (tempProducts != null) {
          editedShop.products = tempProducts;
        }
        setShopState({ shop: editedShop, loading: false });
      }

      setShowMessage(true);
      setSaving(false);
      refresh();
    }
    saveData();
  };

  function refresh() {
    setShopState({ shop: null, loading: true });
    setReloadCount(reloadCount + 1);
  }

  function onMessagePress() {
    setShowMessage(!showMessage);
  }

  if (token == null) {
    return <Text>Error cargando el comercio.</Text>;
  }

  if (shopState.shop == null) {
    return <Text>No hay un comercio en la base de datos para el token {token}</Text>;
  }

  const tempValues = watch();
  let tempShop = trimObject({ ...shopState.shop, ...tempValues });

  let products = shopState.shop?.products ?? [];
  let previewProducts = tempProducts ?? products;

  const width = typeof window !== "undefined" ? window.innerWidth : 1000;
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
              shop={shopState.shop}
              control={control}
              errors={errors}
              handleSubmit={handleSubmit(onSubmit)}
              getValues={getValues}
              isSaving={isSaving}
              refresh={refresh}
            />
            <EditProductsForm products={products} shopId={shopState.shop.id} />
          </Form>
        </View>
        {showPreview && (
          <View style={styles.rightContainer}>
            <a href={`/${shopState.shop.slug}`} style={openProductionLink} rel="noopener noreferrer" target="_blank">
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
