import React from "react";
import {useDispatch} from "react-redux";
import {TouchableHighlight, StyleSheet, Text, View} from "react-native";

import colors from "assets/colors";

export default ({product, promo = false}) => {
  const containerStyle = promo ? styles.card : styles.product;
  const {id, name, description, price, amount} = product;

  return (
    <View key={id} style={[styles.container, containerStyle]}>
      <View style={styles.nameDescription}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Text style={styles.price}>{price && `$${price}`}</Text>
    </View>
  );
};

const anotherBrown = "#B27D23";
const anotherGray = "#8f9bb3";
const yetAnotherOrange = "#FFB234";

const styles = StyleSheet.create({
  ButtonQty: {
    alignItems: "center",
    backgroundColor: yetAnotherOrange,
    borderRadius: "50%",
    borderWidth: 0,
    height: 28,
    justifyContent: "center",
    marginHorizontal: 5,
    marginTop: 12,
    marginVertical: 10,
    width: 28,
  },
  buttonQtyText: {
    color: colors.white,
    fontFamily: "Barlow",
    fontSize: 20,
    fontWeight: "600",
    padding: 5,
    paddingBottom: 8, // TODO: Remove this. I used it to vertically center char
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
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  description: {
    flex: 1,
    flexWrap: "wrap",
    color: anotherGray,
    fontFamily: "Roboto Slab",
    fontSize: 13,
    lineHeight: 17,
  },
  name: {
    flex: 1,
    flexWrap: "wrap",
    fontFamily: "Barlow",
    fontWeight: "600",
    color: colors.darkGray,
    fontSize: 15,
    lineHeight: 18,
    marginBottom: 5,
  },
  nameDescription: {
    flex: 1,
  },
  price: {
    color: anotherBrown,
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
