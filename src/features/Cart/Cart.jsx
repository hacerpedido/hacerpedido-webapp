import React from "react";
import {useSelector} from "react-redux";
import {StyleSheet, ScrollView, View} from "react-native";
import Product from "./Product";
import Form from "./Form";
import Header from "./Header";
import colors from "assets/colors";

export default () => {
  const products = useSelector((state) => state.cart.products);
  // const total = useSelector((state) => state.cart.total);
  // const {deliverycost} = useSelector((state) => state.shop.shop);
  // const deliveryItem = {name: "Delivery", price: deliverycost};
  // const totalItem = {name: "Total", price: total};

  return (
    <View style={styles.container}>
      <Header style={styles.header} />

      <ScrollView style={styles.productList}>
        {products.map((product) => (
          <Product key={product.id} product={product} />
        ))}
        {/* <CartProduct product={totalItem} /> */}
        {/* <CartProduct product={deliveryItem} /> */}
      </ScrollView>

      <Form style={styles.footer} />
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    height: '100vh',
  },
  productList: {
    marginBottom: 21,
    marginTop: 13
  },
});
