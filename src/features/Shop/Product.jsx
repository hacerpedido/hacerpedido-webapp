import React, {useEffect, useState, useRef} from "react";
import {TouchableHighlight, StyleSheet, Text, View} from "react-native";
import {useSelector} from "react-redux";

import ProductAmountPopup from "./ProductAmountPopup";
import {isBetaTester} from "utils/utils";
import colors from "assets/colors";
import {sanitizePrice} from "utils/utils"

export default ({product, promo = false, isPreview = false}) => {
  const ref = useRef(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const containerStyle = promo ? styles.card : styles.product;
  const shop = useSelector((state) => state.shop.shop);
  const {slug} = shop

  const {name, amount, description, price} = product;

  useEffect(() => {
    const listener = event => {
      if (ref.current && !ref.current.contains(event.target)) setPopupVisible(false);
    };

    document.addEventListener("mousedown", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, setPopupVisible]);

  const displayPrice = sanitizePrice(price)

  return (
    <div ref={ref}>
      <TouchableHighlight onPress={() => setPopupVisible(!popupVisible)} underlayColor={"none"}>
        <View style={[styles.container, containerStyle]}>
          <View style={styles.nameDescription}>
            <Text style={styles.name}>
              {name}

              {amount > 0 &&
                <View style={styles.amountContainer}>
                  <Text style={styles.amountText}>{amount}</Text>
                </View>
              }
            </Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <Text style={styles.price}>{displayPrice && `$${displayPrice}`}</Text>


          {!isPreview && isBetaTester(slug) &&
            < View style={styles.buttonQty}>
              <Text style={styles.buttonQtyText}>+</Text>

              <ProductAmountPopup
                product={product}
                amount={amount}
                visible={popupVisible}
                handleClose={() => setPopupVisible(false)} />
            </View>
          }
        </View>
      </TouchableHighlight >
    </div >
  );
};

const styles = StyleSheet.create({
  amountContainer: {
    alignItems: "center",
    backgroundColor: colors.orangeHP,
    borderRadius: 3,
    borderWidth: 0,
    height: 20,
    justifyContent: "center",
    marginLeft: 11,
    width: 20,
  },
  amountText: {
    color: colors.white,
    fontFamily: "Barlow",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonQty: {
    borderColor: colors.lightGreen,
    borderRadius: 2,
    borderWidth: 1,
    height: 20,
    justifyContent: "center",
    marginLeft: 11,
    textAlign: "center",
    width: 20,
  },
  buttonQtyText: {
    color: colors.lightGreen,
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 20,
    paddingBottom: 2
  },
  card: {
    borderColor: colors.cardBorder,
    borderRadius: 7,
    borderWidth: 1,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 52,
  },
  description: {
    flex: 1,
    flexWrap: "wrap",
    color: colors.lightGrey,
    fotiFamily: "Roboto Slab",
    fontSize: 13,
    lineHeight: 17,
  },
  name: {
    flex: 1,
    flexWrap: "wrap",
    fontFamily: "Barlow",
    fontWeight: "600",
    color: colors.brown,
    fontSize: 15,
    lineHeight: 18,
    marginBottom: 5,
  },
  nameDescription: {
    flex: 1,
  },
  price: {
    color: colors.green,
    fontFamily: "Barlow",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
  },
  product: {
    borderBottomWidth: 1,
    borderColor: colors.dividerBorder,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 15,
    paddingBottom: 10,
    paddingRight: 10,
  },
});
