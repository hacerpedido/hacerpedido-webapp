import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import Form from "../components/Cart/Form";
import ProductList from "../components/Cart/ProductList";
import Header from "../components/Cart/Header";
import colors from "../assets/colors";
import { extractSections } from "../lib/utils/products";
import { generateWhatsappURL } from "../lib/utils/utils";

export default function Cart() {
  const shop = useSelector((state) => state.shop.shop);
  const router = useRouter();

  // TODO: Extract to state or utils.js
  let products = useSelector((state) => state.shop.products);
  products = products.filter((p) => p.amount > 0);
  const productsByCategory = extractSections(products);

  if (!shop) {
    router.push("/");
    return null;
  }

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
  },
});
