import React, { useEffect, useRef, useState } from "react";

import { sanitizePrice } from "../../lib/utils/utils";
import styles from "./Product.module.css";
import ProductAmountPopup from "./ProductAmountPopup";

const Product = ({ product, promo = false, isCartEnabled = false }) => {
  const ref = useRef(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const containerStyle = promo ? styles.card : styles.product;
  const { name, amount, description, price } = product;
  const displayPrice = sanitizePrice(price);

  useEffect(() => {
    const listener = (event) => {
      if (ref.current && !ref.current.contains(event.target))
        setPopupVisible(false);
    };
    document.addEventListener("touchend", listener);

    return () => {
      document.removeEventListener("touchend", listener);
    };
  }, [ref, setPopupVisible]);

  const productContent = (
    <div className={`${styles.container} ${containerStyle}`}>
      <div className={styles.nameDescription}>
        <div className={styles.name}>
          {name}

          {amount > 0 && (
            <span className={styles.amountContainer}>
              <span className={styles.amountText}>{amount}</span>
            </span>
          )}
        </div>
        <div className={styles.description}>{description}</div>
      </div>

      <div className={styles.price}>{displayPrice && `$${displayPrice}`}</div>

      {isCartEnabled && (
        <div className={styles.buttonQty}>
          <span className={styles.buttonQtyText}>+</span>
        </div>
      )}
    </div>
  );
  const productId = `product-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className={styles.productRoot} data-testid={productId} ref={ref}>
      {isCartEnabled ? (
        <button
          aria-expanded={popupVisible}
          aria-label={name}
          className={styles.productButton}
          onClick={() => setPopupVisible(!popupVisible)}
          type="button"
        >
          {productContent}
        </button>
      ) : (
        <div>{productContent}</div>
      )}

      {isCartEnabled && (
        <ProductAmountPopup
          amount={amount}
          handleClose={() => setPopupVisible(false)}
          product={product}
          visible={popupVisible}
        />
      )}
    </div>
  );
};

export default Product;
