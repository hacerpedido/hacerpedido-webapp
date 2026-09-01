// @ts-nocheck
import { useCart } from "#lib/context/CartContext";

import React from "react";
import Loading from "../Loading";
import EditMenuLink from "./EditMenuLink";
import ProductList from "./ProductList";
import ShopHeader from "./ShopHeader";
import ShopNotes from "./ShopNotes";
import styles from "./ShopView.module.css";

export default function ShopView({
  isPreview = false,
  shop,
  previewProducts = [],
  isLoading = false,
}) {
  const { state } = useCart();
  const storedProducts = state.products;
  const isCartEnabled = !isPreview && shop && shop.orderswhatsappnumber;
  const products = isPreview ? previewProducts : storedProducts;

  return (
    <div className={styles.scrollView}>
      {process.env.NODE_ENV === "development" &&
      !isPreview &&
      shop?.typeformtoken ? (
        <EditMenuLink shop={shop} />
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
