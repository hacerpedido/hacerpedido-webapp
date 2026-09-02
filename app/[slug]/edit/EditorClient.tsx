"use client";
import EditProductsForm from "#components/EditShop/EditProducts";
import EditShopForm from "#components/EditShop/EditShop";
import styles from "#components/EditShop/EditShopPage.module.css";
import Form from "#components/Form";
import Loading from "#components/Loading";
import MessageBox from "#components/MessageBox";
import ShopView from "#components/Shop/ShopView";
import type { Product, Shop } from "#lib/types";
import { trimObject } from "#lib/utils/utils";

import axios, { type AxiosError } from "axios";
import Image from "next/image";
import { useParams } from "next/navigation";
import type React from "react";
import {
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form/dist/index.ie11";

// Para probar:
// http://localhost:3000/cfb6d51e87pfxuosysumcfb6d51vpka4/edit
// http://localhost:3000/test6grt3kg7w8x0w250yunjc6gru6f6/edit
// https://hacerpedido.com/test6grt3kg7w8x0w250yunjc6gru6f6/edit

type EditorFieldValue = string | number | undefined;

interface EditorFormData extends Record<string, EditorFieldValue> {
  address?: string;
  deliverycost?: string | number;
  id?: string | number;
  name?: string;
  notes?: string;
  opentimes?: string;
  ordersphonenumber?: string;
  orderswhatsappnumber?: string;
  products?: string;
  token?: string;
}

type EditorFormValues = Record<string, string>;

interface EditorActionState {
  error?: number;
  message: string;
  products?: Product[] | null;
  values?: EditorFormValues;
}

interface ShopState {
  loading: boolean;
  shop: Shop | null;
}

interface EditorApiError {
  message?: unknown;
}

type EditorFormMethods = ReturnType<typeof useForm<EditorFormData>>;

type FormProps = Pick<
  EditorFormMethods,
  "control" | "errors" | "register" | "setValue"
> & {
  children: React.ReactNode;
};

type MessageBoxProps = {
  isError: boolean;
  message: string;
  onMessagePress: () => void;
};

type ShopViewProps = {
  isPreview: boolean;
  previewProducts: Product[];
  shop: PreviewShop;
};

type PreviewShop = Omit<Shop, "products"> & {
  products?: Product[] | string;
};

const TypedForm = Form as unknown as React.ComponentType<FormProps>;
const TypedMessageBox =
  MessageBox as unknown as React.ComponentType<MessageBoxProps>;
const TypedShopView = ShopView as unknown as React.ComponentType<ShopViewProps>;

function getApiError(error: unknown): AxiosError<EditorApiError> | null {
  if (!axios.isAxiosError(error)) return null;
  return error as AxiosError<EditorApiError>;
}

function getApiErrorMessage(error: unknown): string | undefined {
  const axiosError = getApiError(error);
  const message = axiosError?.response?.data?.message;
  return typeof message === "string" ? message : undefined;
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null || !("name" in value)) {
    return false;
  }

  const product = value as Record<string, unknown>;
  const isStringOrNumber = (field: unknown): boolean =>
    typeof field === "string" || typeof field === "number";

  return (
    isStringOrNumber(product.name) &&
    (!("id" in product) || isStringOrNumber(product.id)) &&
    (!("description" in product) || typeof product.description === "string") &&
    (!("price" in product) || isStringOrNumber(product.price)) &&
    (!("category" in product) ||
      product.category === null ||
      typeof product.category === "string") &&
    (!("shopid" in product) || isStringOrNumber(product.shopid)) &&
    (!("itemnumber" in product) || typeof product.itemnumber === "number") &&
    (!("amount" in product) || typeof product.amount === "number")
  );
}

function parseProducts(
  value: FormDataEntryValue | undefined,
): Product[] | null {
  if (typeof value !== "string") return null;

  const parsed: unknown = JSON.parse(value || "null");
  if (parsed === null) return null;
  if (!Array.isArray(parsed) || !parsed.every(isProduct)) {
    throw new Error("Invalid products");
  }

  return parsed;
}

function getFormFromEvent(
  event?: React.BaseSyntheticEvent,
): HTMLFormElement | null {
  const target = event?.currentTarget;
  if (target instanceof HTMLFormElement) return target;
  if (
    target instanceof HTMLButtonElement ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  ) {
    return target.form;
  }

  return null;
}

function setFormFieldValue(
  form: HTMLFormElement,
  key: string,
  value: EditorFieldValue,
): void {
  const field = form.elements.namedItem(key);
  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLSelectElement ||
    field instanceof HTMLTextAreaElement ||
    field instanceof RadioNodeList
  ) {
    field.value = String(value ?? "");
  }
}

export default function EditShopPage() {
  const [shopState, setShopState] = useState<ShopState>({
    shop: null,
    loading: true,
  });
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const submitLock = useRef(false);
  const [productsRevision, setProductsRevision] = useState(0);
  const [tempProducts, setTempProducts] = useState<Product[] | null>(null);
  const serverProducts = shopState.shop?.products ?? [];
  const [optimisticProducts, addOptimisticProducts] = useOptimistic(
    tempProducts ?? serverProducts,
    (_currentProducts: Product[], nextProducts: Product[]) => nextProducts,
  );
  const [, startPreviewTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();
  const [actionState, formAction, isSaving] = useActionState<
    EditorActionState,
    FormData
  >(
    async (
      _previous: EditorActionState,
      formData: FormData,
    ): Promise<EditorActionState> => {
      const values: EditorFormValues = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") values[key] = value;
      }
      let submittedProducts: Product[] | null = null;

      try {
        submittedProducts = parseProducts(values.products);
      } catch {
        return {
          message: "Productos inválidos.",
          error: 1,
          values,
        };
      }

      try {
        const response = await axios.post<EditorActionState>(
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
          message: getApiErrorMessage(error) ?? "Datos inválidos.",
          error: 1,
          products: submittedProducts,
          values,
        };
      }
    },
    { message: "" },
  );
  const [reloadCount, setReloadCount] = useState(0);

  const params = useParams<{ slug: string }>();
  const token = params?.slug;

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
        const shopData = await axios.get<Shop>(
          `${window.location.origin}/api/shop/by-token`,
          { params: { token } },
        );

        setShopState({ shop: shopData.data, loading: false });
      } catch (error) {
        // Token sin shop: el API responde 404 y la página muestra el estado
        // not-found (renderizado abajo) sin molestar con un alert. (#128)
        const axiosError = getApiError(error);
        if (axiosError?.response?.status === 404) {
          setShopState({ shop: null, loading: false });
          return;
        }

        const message = getApiErrorMessage(error);
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
  } = useForm<EditorFormData>({
    mode: "onBlur",
  });

  useEffect(() => {
    if (!actionState.message || isSaving) return;

    submitLock.current = false;
    if (actionState.values) {
      for (const [key, value] of Object.entries(actionState.values)) {
        if (key !== "products") setValue(key, value, {});
      }
    }

    setMessage(actionState.message);
    setShowMessage(true);

    // Keep the server response as the new base after a successful save. On a
    // rejected save, restore the server products and remount the grid so its
    // internal Handsontable state cannot make the failed draft look persisted.
    const savedProducts = actionState.products;
    if (!actionState.error && savedProducts) {
      setShopState((current) =>
        current.shop
          ? {
              ...current,
              shop: { ...current.shop, products: savedProducts },
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

  const tempValues = watch();
  const tempShop = trimObject({ ...(shopState.shop ?? {}), ...tempValues });

  useEffect(() => {
    if (tempShop.name) {
      document.title = `${tempShop.name} | Hacer Pedido`;
    }
  }, [tempShop.name]);

  if (shopState.loading) {
    return <Loading />;
  }

  const onSubmit = (
    data: EditorFormData,
    form: HTMLFormElement | null,
  ): void => {
    if (submitLock.current || isSaving || isActionPending) return;

    if (!form) return;
    const shop = shopState.shop;
    if (!shop) return;
    const values = trimObject({ ...data, id: shop.id, token });
    for (const [key, value] of Object.entries(values)) {
      setFormFieldValue(form, key, value);
    }
    submitLock.current = true;
    startActionTransition(() => formAction(new FormData(form)));
  };

  const showSaveMessage = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
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
    handleSubmit((data: EditorFormData) => onSubmit(data, form))(event);
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

  const previewShop: PreviewShop = { ...tempShop, slug: shopState.shop.slug };

  const width = typeof window !== "undefined" ? window.innerWidth : 1000;
  const showPreview = width > 1000;

  const isClientError = Object.keys(errors).length > 0;
  const isError = isClientError || Boolean(actionState.error);

  return (
    <>
      <main className={styles.container}>
        <section className={styles.leftContainer}>
          <TypedForm {...{ register, setValue, errors, control }}>
            <form
              onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const form = event.currentTarget;
                handleSubmit((data: EditorFormData) => onSubmit(data, form))(
                  event,
                );
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
                handleSubmit={handleSubmit(
                  (data: EditorFormData, event?: React.BaseSyntheticEvent) =>
                    onSubmit(data, getFormFromEvent(event)),
                )}
                isSaving={isSaving || isActionPending}
                onSave={showSaveMessage}
                refresh={refresh}
                shop={shopState.shop}
              />
              <EditProductsForm
                key={productsRevision}
                onTempProductsChange={(nextProducts: Product[]) => {
                  setTempProducts(nextProducts);
                  startPreviewTransition(() => {
                    addOptimisticProducts(nextProducts);
                  });
                }}
                products={serverProducts}
                shopId={shopState.shop.id}
              />
            </form>
          </TypedForm>
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
            <TypedShopView
              isPreview={true}
              previewProducts={optimisticProducts}
              shop={previewShop}
            />
          </aside>
        )}
      </main>

      {showMessage && (
        <TypedMessageBox
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
