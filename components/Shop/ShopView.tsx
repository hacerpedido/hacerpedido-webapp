// @ts-nocheck
"use client";
import { useCart } from "#lib/context/CartContext";
import type { Product, Shop } from "#lib/types";

import React, { useEffect } from "react";
import Loading from "../Loading";
import EditMenuLink from "./EditMenuLink";
import ProductList from "./ProductList";
import ShopHeader from "./ShopHeader";
import ShopNotes from "./ShopNotes";
import styles from "./ShopView.module.css";

type ShopViewProps = {
  editToken?: string | null;
  isLoading?: boolean;
  isPreview?: boolean;
  previewProducts?: Product[];
  shop?: Shop;
};

export default function ShopView({
  isPreview = false,
  shop,
  previewProducts = [],
  isLoading = false,
  editToken = null,
}: ShopViewProps) {
  const { state, dispatch } = useCart();
  useEffect(() => {
    if (!isPreview && shop) dispatch({ type: "SET_SHOP", payload: shop });
  }, [dispatch, isPreview, shop]);
  const storedProducts = state.products;
  const isCartEnabled = !isPreview && shop && shop.orderswhatsappnumber;
  const products = isPreview ? previewProducts : storedProducts;
  const developmentEditToken = editToken ?? shop?.typeformtoken;

  return (
    <div className={styles.scrollView}>
      {process.env.NODE_ENV === "development" &&
      !isPreview &&
      developmentEditToken ? (
        <EditMenuLink shop={{ ...shop, typeformtoken: developmentEditToken }} />
      ) : null}
      <ShopHeader isPreview={isPreview} shop={shop} />

      <div className={styles.container}>
        {!isPreview && isLoading ? (
          <Loading />
        ) : (
          products.length > 0 && (
            <>
              <ProductList isCartEnabled={isCartEnabled} products={products} />
              <ShopNotes shop={shop} />
            </>
          )
        )}
      </div>
    </div>
  );
}
