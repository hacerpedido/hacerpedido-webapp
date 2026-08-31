import React from "react";
import styles from "./ShopNotes.module.css";

const ShopNotes = ({ shop }) => {
  if (shop.notes) {
    return (
      <section className={styles.container}>
        <h2 className={styles.category}>Notas</h2>
        <p className={styles.notes}>{shop.notes}</p>
      </section>
    );
  }

  return null;
};

export default ShopNotes;
