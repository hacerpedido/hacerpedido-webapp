import React from "react";
import { StyleSheet, View } from "react-native";
import { Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import Form from "./Form";
import ProductList from "./ProductList";
import Header from "./Header";
import colors from "../../assets/colors";
import { extractSections } from "../../lib/utils/products";
import { generateWhatsappURL } from "../../lib/utils/utils";

export default function Cart() {
  const shop = useSelector((state) => state.shop.shop);
  // TODO: Extract to state or utils.js
  let products = useSelector((state) => state.shop.products);
  products = products.filter((p) => p.amount > 0);
  const productsByCategory = extractSections(products);

  if (!shop) return <Redirect to="/" />;

  const onSubmit = (data) => {
    const { orderswhatsappnumber } = shop;
    const url = generateWhatsappURL(
      orderswhatsappnumber,
      data,
      productsByCategory
    );
    window.location.href = url;
  };

  return (
    <View style={styles.container}>
      <Header style={styles.header} />

      <View style={styles.bodyContainer}>
        <ProductList products={productsByCategory} />
        <Form style={styles.footer} onSubmit={onSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bodyContainer: {
    marginHorizontal: 24,
  },
  container: {
    backgroundColor: colors.white,
    // position: 'absolute',
    // width: '100%',
  },
});
