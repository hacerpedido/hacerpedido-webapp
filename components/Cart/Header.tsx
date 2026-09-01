// @ts-nocheck
import { ArrowLeft as ArrowLeftIcon } from "#assets/icons";
import { useCart } from "#lib/context/CartContext";

import { useRouter } from "next/router";
import React from "react";
import styles from "./Header.module.css";

export default function CartHeader() {
  const { state } = useCart();
  const { slug } = state.shop;
  const router = useRouter();

  return (
    <header className={styles.container}>
      <div className={styles.containerNavigator}>
        <button
          aria-label="Volver"
          className={styles.buttonBack}
          onClick={() => router.push(`/${slug}`)}
          type="button"
        >
          <ArrowLeftIcon />
        </button>
      </div>

      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Revisar mi Pedido</h1>
      </div>
    </header>
  );
}
