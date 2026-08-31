import React, { useEffect, useState, useRef } from "react";
import { TouchableHighlight, Text, View } from "react-native";

import ProductAmountPopup from "./ProductAmountPopup";
import { sanitizePrice } from "../../lib/utils/utils";
import styles from "./Product.module.css";

const Product = ({ product, promo = false, isCartEnabled = false }) => {
  const ref = useRef(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const containerStyle = promo ? styles.card : styles.product;
  const { name, amount, description, price } = product;
  const displayPrice = sanitizePrice(price);

  useEffect(() => {
    const listener = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setPopupVisible(false);
    };
    document.addEventListener("touchend", listener);

    return () => {
      document.removeEventListener("touchend", listener);
    };
  }, [ref, setPopupVisible]);

  return (
    <div ref={ref}>
      <TouchableHighlight
        accessibilityLabel={name}
        accessibilityRole="button"
        onPress={() => setPopupVisible(!popupVisible)}
        testID={`product-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        underlayColor={"none"}
      >
        <View classList={[styles.container, containerStyle]}>
          <View classList={[styles.nameDescription]}>
            <Text classList={[styles.name]}>
              {name}

              {amount > 0 && (
                <View classList={[styles.amountContainer]}>
                  <Text classList={[styles.amountText]}>{amount}</Text>
                </View>
              )}
            </Text>
            <Text classList={[styles.description]}>{description}</Text>
          </View>

          <Text classList={[styles.price]}>{displayPrice && `$${displayPrice}`}</Text>

          {isCartEnabled && (
            <View classList={[styles.buttonQty]}>
              <Text classList={[styles.buttonQtyText]}>+</Text>

              <ProductAmountPopup
                product={product}
                amount={amount}
                visible={popupVisible}
                handleClose={() => setPopupVisible(false)}
              />
            </View>
          )}
        </View>
      </TouchableHighlight>
    </div>
  );
};

export default Product;
