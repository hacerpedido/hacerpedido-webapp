import React from "react";

import Product from "./Product";
import styles from "./ProductList.module.css";

const ProductList = ({ products, shop }) => (
  <div className={styles.container}>
    {products.map((category, index) => (
      <section key={index} className={styles.categorySection}>
        <h2 className={styles.category}>{category.name}</h2>
        <ul className={styles.products}>
          {category.products.map((product) => (
            <Product key={product.id} product={product} shop={shop} />
          ))}
        </ul>
      </section>
    ))}
  </div>
);

export default ProductList;
