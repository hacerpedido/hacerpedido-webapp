// @ts-nocheck
import { useCart } from "#lib/context/CartContext";

import React, { useState } from "react";
import { animated, config, useTransition } from "react-spring";
import styles from "./ProductAmountPopup.module.css";

const ProductAmountPopup = ({ product, amount, visible, handleClose }) => {
  const [popUpAmount, setPopUpAmount] = useState(amount);
  const { dispatch } = useCart();

  const transitions = useTransition(visible, null, {
    from: { opacity: 0, transform: "scale(0, 0)" },
    enter: { opacity: 1, transform: "scale(1, 1)" },
    leave: { opacity: 0, transform: "scale(0, 0)" },
    config: config.stiff,
  });

  const updateAmount = (newAmount, persist = false) => {
    if (newAmount < 0) return false;

    setPopUpAmount(newAmount);

    if (persist) {
      handleClose();
      dispatch({ type: "SET_AMOUNT", payload: { product, amount: newAmount } });
    }
  };

  return transitions.map(
    ({ item, key, props }) =>
      item && (
        <animated.div key={key} style={props}>
          <div
            aria-label="Quantity selector"
            className={styles.container}
            data-testid="quantity-popup"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Decrease quantity"
              className={styles.buttonQty}
              onClick={() => updateAmount(popUpAmount - 1)}
              type="button"
            >
              <span className={styles.buttonQtyText}>-</span>
            </button>

            <span className={styles.amountText}>{popUpAmount}</span>

            <button
              aria-label="Increase quantity"
              className={`${styles.buttonQty} ${styles.buttonPlus}`}
              data-testid="quantity-increase"
              onClick={() => updateAmount(popUpAmount + 1)}
              type="button"
            >
              <span
                className={`${styles.buttonQtyText} ${styles.buttonPlusText}`}
              >
                +
              </span>
            </button>

            <div className={styles.lineBreak} />

            <button
              aria-label="Add product"
              className={styles.buttonSubmit}
              data-testid="quantity-add"
              onClick={() => updateAmount(popUpAmount, true)}
              type="button"
            >
              <span className={styles.buttonSubmitText}>Agregar</span>
            </button>

            <div className={styles.lineBreak} />

            <button
              aria-label="Close quantity selector"
              className={styles.closeButton}
              onClick={handleClose}
              type="button"
            >
              <span className={styles.closeButtonIcon}>+</span>
            </button>
          </div>
        </animated.div>
      ),
  );
};

export default ProductAmountPopup;
