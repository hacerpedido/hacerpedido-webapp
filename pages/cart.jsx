import React from "react";
import { useRouter } from "next/router";

import Form from "../components/Cart/Form";
import ProductList from "../components/Cart/ProductList";
import Header from "../components/Cart/Header";
import { useCart } from "../lib/context/CartContext";
import { extractSections } from "../lib/utils/products";
import { generateWhatsappURL } from "../lib/utils/utils";
import styles from "./cart.module.css";

export default function Cart() {
  const { state } = useCart();
  const shop = state.shop;
  const router = useRouter();
  const products = state.products.filter((product) => product.amount > 0);
  const productsByCategory = extractSections(products);

  if (!shop) {
    router.push("/");
    return null;
  }

  const onSubmit = (data) => {
    const { orderswhatsappnumber } = shop;
    const url = generateWhatsappURL(orderswhatsappnumber, data, productsByCategory);
    window.location.href = url;
  };

  return (
    <main className={styles.container}>
      <Header />
      <div className={styles.bodyContainer}>
        <ProductList products={productsByCategory} />
        <Form onSubmit={onSubmit} />
      </div>
    </main>
  );
}
