import React from "react";
import { useSelector } from "react-redux";

import Loading from "../Loading";
import ShopHeader from "./ShopHeader";
import ShopNotes from "./ShopNotes";
import ProductList from "./ProductList";
import EditMenuLink from "./EditMenuLink";
import styles from "./ShopView.module.css";

export default function ShopView({ isPreview = false, shop, previewProducts = [] }) {
  const isLoading = useSelector((state) => state.app.loading);
  const storedProducts = useSelector((state) => state.shop.products);
  const isCartEnabled = !isPreview && shop && shop.orderswhatsappnumber;
  const products = isPreview ? previewProducts : storedProducts;

  return (
    <div className={styles.scrollView}>
      {process.env.NODE_ENV === "development" && !isPreview && shop?.typeformtoken ? <EditMenuLink shop={shop} /> : null}
      <ShopHeader isPreview={isPreview} shop={shop} />

      <div className={styles.container}>
        {!isPreview && isLoading ? (
          <Loading />
        ) : (
          products.length > 0 && (
            <>
              <ProductList products={products} isCartEnabled={isCartEnabled} />
              <ShopNotes shop={shop} />
            </>
          )
        )}
      </div>
    </div>
  );
}
