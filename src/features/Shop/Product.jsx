import React, {useState} from "react";
// import {useDispatch} from "react-redux";
import {TouchableHighlight, StyleSheet, Text, View} from "react-native";
import ProductAmountPopup from "./ProductAmountPopup";
import colors from "assets/colors";

export default ({product, promo = false}) => {
  // const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const containerStyle = promo ? styles.card : styles.product;
  const {id, name, description, price} = product;

  const onAmountShow = () => setShow(!show)

  return (
    <View key={id} style={[styles.container, containerStyle]}>
      <View style={styles.nameDescription}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <Text style={styles.price}>{price && `$${price}`}</Text>

      <TouchableHighlight onPress={() => onAmountShow()} underlayColor={"none"} >
        <View>
          <View style={styles.buttonQty}>
            <Text style={styles.buttonQtyText}>+</Text>
          </View>

          <ProductAmountPopup product={product} show={show} handleShow={onAmountShow} />
        </View>
      </TouchableHighlight>
    </View >
  );
};

const styles = StyleSheet.create({
  buttonQty: {
    borderColor: colors.lightGreen,
    borderRadius: 2,
    borderWidth: 1,
    height: 20,
    justifyContent: "center",
    marginLeft: 11,
    textAlign: "center",
    width: 20,
    // marginHorizontal: 5,
    // marginTop: 12,
    // marginVertical: 10,
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
