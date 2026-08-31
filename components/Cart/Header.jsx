import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

import { ArrowLeft as ArrowLeftIcon } from "../../assets/icons";
import styles from "./Header.module.css";

export default function CartHeader() {
  const { slug } = useSelector((state) => state.shop.shop);
  const router = useRouter();

  return (
    <header className={styles.container}>
      <div className={styles.containerNavigator}>
        <button type="button" className={styles.buttonBack} onClick={() => router.push(`/${slug}`)} aria-label="Volver">
          <ArrowLeftIcon />
        </button>
      </div>

      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Revisar mi Pedido</h1>
      </div>
    </header>
  );
}
