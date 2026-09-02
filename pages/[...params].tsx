// @ts-nocheck
import EditProductsForm from "#components/EditShop/EditProducts";
import EditShopForm from "#components/EditShop/EditShop";
import Form from "#components/Form";
import Loading from "#components/Loading";
import MessageBox from "#components/MessageBox";
import ShopView from "#components/Shop/ShopView";
import { trimObject } from "#lib/utils/utils";

import axios from "axios";
import ErrorPage from "next/error";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, {
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
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
  const submitLock = useRef(false);
  const [productsRevision, setProductsRevision] = useState(0);
  const [tempProducts, setTempProducts] = useState(null);
  const serverProducts = shopState.shop?.products ?? [];
  const [optimisticProducts, addOptimisticProducts] = useOptimistic(
    tempProducts ?? serverProducts,
    (_currentProducts, nextProducts) => nextProducts,
  );
  const [, startPreviewTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();
  const [actionState, formAction, isSaving] = useActionState(
    async (_previous, formData) => {
      const values = Object.fromEntries(formData.entries());
      let submittedProducts = null;

      try {
        submittedProducts = JSON.parse(values.products || "null");
      } catch {
        return {
          message: "Productos inválidos.",
          error: 1,
          values,
        };
      }

      try {
        const response = await axios.post(
          `${window.location.origin}/api/shop/editor`,
          {
            shop: Object.fromEntries(
              Object.entries(values).filter(([key]) => key !== "products"),
            ),
            products: submittedProducts,
          },
        );
        return { ...response.data, products: submittedProducts, values };
      } catch (error) {
        return {
          message: error.response?.data?.message ?? "Datos inválidos.",
          error: 1,
          products: submittedProducts,
          values,
        };
      }
    },
    { message: "" },
  );
  const [reloadCount, setReloadCount] = useState(0);

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

  useEffect(() => {
    if (!actionState.message || isSaving) return;

    submitLock.current = false;
    if (actionState.values) {
      for (const [key, value] of Object.entries(actionState.values)) {
        if (key !== "products") setValue(key, value, true);
      }
    }

    setMessage(actionState.message);
    setShowMessage(true);

    // Keep the server response as the new base after a successful save. On a
    // rejected save, restore the server products and remount the grid so its
    // internal Handsontable state cannot make the failed draft look persisted.
    if (!actionState.error && Array.isArray(actionState.products)) {
      setShopState((current) =>
        current.shop
          ? {
              ...current,
              shop: { ...current.shop, products: actionState.products },
            }
          : current,
      );
    }
    setTempProducts(null);
    setProductsRevision((revision) => revision + 1);
    // Do not refresh the editor immediately after a successful save. Next.js
    // 16 batches this state update with the refresh, which remounts the page
    // and clears `showMessage` before the confirmation can be painted. The
    // submitted values are already in the form; a reload (or an image upload,
    // which calls refresh explicitly) gets the persisted server state.
  }, [actionState, isSaving]);

  if (!params || shopState.loading) {
    return <Loading />;
  }

  // Sólo para las páginas de edit por ahora
  if (params[1] !== "edit") {
    return <ErrorPage statusCode={404} />;
  }

  const onSubmit = (data, form) => {
    if (submitLock.current || isSaving || isActionPending) return;

    if (!form) return;
    const values = trimObject({ ...data, id: shopState.shop.id, token });
    for (const [key, value] of Object.entries(values))
      form.elements[key].value = value ?? "";
    submitLock.current = true;
    startActionTransition(() => formAction(new FormData(form)));
  };

  const showSaveMessage = (event) => {
    if (submitLock.current || isSaving || isActionPending) {
      event.preventDefault();
      return;
    }

    // The click handler is used so the existing SaveButton remains keyboard
    // accessible, but validation and the action are still owned by the form.
    // Preventing the browser submit here avoids dispatching the same action a
    // second time through the form's onSubmit handler.
    event.preventDefault();
    const form = event.currentTarget.form;
    handleSubmit((data) => onSubmit(data, form))(event);
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

  const width = typeof window !== "undefined" ? window.innerWidth : 1000;
  const showPreview = width > 1000;

  const isClientError = Object.keys(errors).length > 0;
  const isError = isClientError || Boolean(actionState.error);

  return (
    <>
      <Head>
        <title>{tempShop.name} | Hacer Pedido</title>
      </Head>

      <main className={styles.container}>
        <section className={styles.leftContainer}>
          <Form {...{ register, setValue, errors, control }}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                handleSubmit((data) => onSubmit(data, form))(event);
              }}
            >
              <input
                name="id"
                readOnly
                type="hidden"
                value={shopState.shop.id}
              />
              <input name="token" readOnly type="hidden" value={token} />
              <input
                name="products"
                readOnly
                type="hidden"
                value={JSON.stringify(tempProducts)}
              />
              <EditShopForm
                control={control}
                errors={errors}
                getValues={getValues}
                handleSubmit={handleSubmit((data, event) =>
                  onSubmit(
                    data,
                    event?.currentTarget?.form ?? event?.currentTarget,
                  ),
                )}
                isSaving={isSaving || isActionPending}
                onSave={showSaveMessage}
                refresh={refresh}
                shop={shopState.shop}
              />
              <EditProductsForm
                key={productsRevision}
                onTempProductsChange={(nextProducts) => {
                  setTempProducts(nextProducts);
                  startPreviewTransition(() => {
                    addOptimisticProducts(nextProducts);
                  });
                }}
                products={serverProducts}
                shopId={shopState.shop.id}
              />
            </form>
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
                <Image
                  alt=""
                  className={styles.openProductionLinkIcon}
                  height={16}
                  src="/images/external-link-alt.png"
                  width={18}
                />
              </span>
            </a>
            <ShopView
              isPreview={true}
              previewProducts={optimisticProducts}
              shop={tempShop}
            />
          </aside>
        )}
      </main>

      {showMessage && (
        <MessageBox
          isError={isError}
          message={
            isClientError
              ? "Hubo errores en los datos que ingresaste. Por favor revisalos y grabá nuevamente."
              : message
          }
          onMessagePress={onMessagePress}
        />
      )}
    </>
  );
}
