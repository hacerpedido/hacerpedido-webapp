import React, {useState} from "react";
import {TouchableHighlight, StyleSheet, Text, View} from "react-native";
import ProductAmountPopup from "./ProductAmountPopup";
import colors from "assets/colors";

export default ({product, promo = false}) => {
  const [show, setShow] = useState(false);
  const [amount, setAmount] = useState(0);
  const containerStyle = promo ? styles.card : styles.product;
  const {id, name, description, price} = product;

  return (
    <TouchableHighlight key={id} onPress={() => setShow(true)} underlayColor={"none"}>
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

        <Text style={styles.price}>{price && `$${price}`}</Text>

        <View style={styles.buttonQty}>
          <Text style={styles.buttonQtyText}>+</Text>

          {show &&
            <ProductAmountPopup
              product={product}
              amount={amount}
              setShow={setShow}
              setAmount={setAmount} />
          }
        </View>
      </View>
    </TouchableHighlight >
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
    color: colors.darkBrown,
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
