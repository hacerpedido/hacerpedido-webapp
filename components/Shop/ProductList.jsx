import React from "react";

import Divider from "../Divider";
import Product from "./Product";
import styles from "./ProductList.module.css";

// TODO: Merge with cart/productList.jsx
export default function ProductList({ products, isCartEnabled = false }) {
  const listItems = [];
  let lastCategory = "";
  let item = 0;

  products.forEach((product) => {
    const { category } = product;

    // TODO: mejorar esto, deberíamos tener un dato, en vez de usar el nombre "Promociones"
    const isPromo = category === "Promociones";

    if (lastCategory !== category) {
      if (item !== 0 && !isPromo) {
        listItems.push(<Divider key={item++} />);
      }

      listItems.push(
        <div key={item++} className={styles.category}>
          {category}
        </div>
      );

      lastCategory = category;
    }

    listItems.push(<Product key={item++} product={product} promo={isPromo} isCartEnabled={isCartEnabled} />);
  });

  listItems.push(<Divider key={item++} />);

  return <>{listItems}</>;
}
