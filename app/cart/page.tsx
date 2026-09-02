"use client";

import Form from "#components/Cart/Form";
import Header from "#components/Cart/Header";
import ProductList from "#components/Cart/ProductList";
import { useCart } from "#lib/context/CartContext";
import type { CartFormData } from "#lib/types";
import { extractSections } from "#lib/utils/products";
import { generateWhatsappURL } from "#lib/utils/utils";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import styles from "./page.module.css";

export default function CartPage() {
  const { state, isRestored } = useCart();
  const router = useRouter();
  const shop = state.shop;

  useEffect(() => {
    if (isRestored && !shop) router.push("/");
  }, [isRestored, shop, router]);

  if (!isRestored || !shop) return null;

  const productsByCategory = extractSections(
    state.products.filter((product) => (product.amount ?? 0) > 0),
  );

  const onSubmit = (data: CartFormData) => {
    window.location.href = generateWhatsappURL(
      shop.orderswhatsappnumber,
      data,
      productsByCategory,
    );
  };

  return (
    <main className={styles.container}>
      <Header />
      <div className={styles.bodyContainer}>
        <ProductList products={productsByCategory} shop={shop} />
        <Form onSubmit={onSubmit} />
      </div>
    </main>
  );
}
