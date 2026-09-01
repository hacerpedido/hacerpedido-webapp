import React from "react";
import styles from "./Product.module.css";

const Product = ({ product }) => {
  const { amount, description, name } = product;

  return (
    <li className={styles.container}>
      <span className={styles.amount}>{amount}</span>
      <div className={styles.nameDescription}>
        <span className={styles.text}>{name}</span>
        <span className={styles.description}>{description}</span>
      </div>
    </li>
  );
};

export default Product;
