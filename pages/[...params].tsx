// @ts-nocheck
import EditProductsForm from "#components/EditShop/EditProducts";
import EditShopForm from "#components/EditShop/EditShop";
import Form from "#components/Form";
import Loading from "#components/Loading";
import MessageBox from "#components/MessageBox";
import ShopView from "#components/Shop/ShopView";
import { saveShopWithProducts } from "#lib/api/shops";
import { trimObject } from "#lib/utils/utils";

import axios from "axios";
import ErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./[...params].module.css";

// Para probar:
// http://localhost:3000/cfb6d51e87pfxuosysumcfb6d51vpka4/edit
// http://localhost:3000/test6grt3kg7w8x0w250yunjc6gru6f6/edit
// https://hacerpedido.com/test6grt3kg7w8x0w250yunjc6gru6f6/edit

export default function EditShopPage() {
  const router = useRouter();

  const [shopState, setShopState] = useState({ shop: null, loading: true });
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [isSaving, setSaving] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [tempProducts, setTempProducts] = useState(null);

  const { params } = router.query;

  const token = typeof params !== "undefined" ? params[0] : undefined;

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
        const shopData = await axios.get(
          `${window.location.origin}/api/shop/by-token`,
          { params: { token } },
        );

        setShopState({ shop: shopData.data, loading: false });
      } catch (error) {
        // Token sin shop: el API responde 404 y la página muestra el estado
        // not-found (renderizado abajo) sin molestar con un alert. (#128)
        if (error.response && error.response.status === 404) {
          setShopState({ shop: null, loading: false });
          return;
        }

        const message = error.response?.data?.message;
        alert(
          `Error al leer los datos. (${error} Error: ${message ?? "Desconocido"})`,
        );
        setShopState({ shop: null, loading: false });
      }
    }
    getData();
  }, [token, reloadCount]);

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
      const dataToSave = {
        ...data,
        id: shopState.shop.id,
        slug: shopState.shop.slug,
        region: shopState.shop.region,
      };

      const result = await saveShopWithProducts(
        token,
        dataToSave,
        tempProducts,
        "/api/shop/editor",
      );
      setMessage(result.message);

      if (result.error == null) {
        const editedShop = { ...shopState.shop, ...dataToSave };
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
    return <p>Error cargando el comercio.</p>;
  }

  if (shopState.shop == null) {
    return <p>No hay un comercio en la base de datos para el token {token}</p>;
  }

  const tempValues = watch();
  const tempShop = trimObject({ ...shopState.shop, ...tempValues });

  const products = shopState.shop?.products ?? [];
  const previewProducts = tempProducts ?? products;

  const width = typeof window !== "undefined" ? window.innerWidth : 1000;
  const showPreview = width > 1000;

  const isError = Object.keys(errors).length > 0;

  return (
    <>
      <Head>
        <title>{tempShop.name} | Hacer Pedido</title>
      </Head>

      <main className={styles.container}>
        <section className={styles.leftContainer}>
          <Form {...{ register, setValue, errors, control }}>
            <EditShopForm
              control={control}
              errors={errors}
              getValues={getValues}
              handleSubmit={handleSubmit(onSubmit)}
              isSaving={isSaving}
              refresh={refresh}
              shop={shopState.shop}
            />
            <EditProductsForm
              onTempProductsChange={setTempProducts}
              products={products}
              shopId={shopState.shop.id}
            />
          </Form>
        </section>
        {showPreview && (
          <aside className={styles.rightContainer}>
            <a
              className={styles.productionLink}
              href={`/${shopState.shop.slug}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className={styles.openProductionLink}>
                Ir a mi Sitio
                <img
                  alt=""
                  className={styles.openProductionLinkIcon}
                  src="/images/external-link-alt.png"
                />
              </span>
            </a>
            <ShopView
              isPreview={true}
              previewProducts={previewProducts}
              shop={tempShop}
            />
          </aside>
        )}
      </main>

      {showMessage && (
        <MessageBox
          isError={isError}
          message={
            isError
              ? "Hubo errores en los datos que ingresaste. Por favor revisalos y grabá nuevamente."
              : message
          }
          onMessagePress={onMessagePress}
        />
      )}
    </>
  );
}
