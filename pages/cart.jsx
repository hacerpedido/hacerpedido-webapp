import Form from "#components/Cart/Form";
import Header from "#components/Cart/Header";
import ProductList from "#components/Cart/ProductList";
import { useCart } from "#lib/context/CartContext";
import { extractSections } from "#lib/utils/products";
import { generateWhatsappURL } from "#lib/utils/utils";

import { useRouter } from "next/router";
import React, { useEffect } from "react";
import styles from "./cart.module.css";

export default function Cart() {
  const { state, isHydrated } = useCart();
  const shop = state.shop;
  const router = useRouter();

  // Redirect to home only after hydration is complete and there is no shop
  useEffect(() => {
    if (isHydrated && !shop) {
      router.push("/");
    }
  }, [isHydrated, shop, router]);

  // Prevent redirect before hydration completes — show a loading state
  if (!isHydrated || !shop) return null;

  const products = state.products.filter((product) => product.amount > 0);
  const productsByCategory = extractSections(products);

  const onSubmit = (data) => {
    const { orderswhatsappnumber } = shop;
    const url = generateWhatsappURL(
      orderswhatsappnumber,
      data,
      productsByCategory,
    );
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

// cart.jsx is client-only, prevent static prerendering
export async function getServerSideProps() {
  return { props: {} };
}
