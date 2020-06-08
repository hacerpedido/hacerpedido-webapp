import React from "react";
import {StyleSheet, Text} from "react-native";

import Product from "./Product";
import Divider from "components/Divider";
import colors from "assets/colors";

// TODO: Merge with cart/productList.jsx
export default ({products, isPreview = false}) => {
  const listItems = [];
  let lastCategory = "";
  let item = 0;

  products.forEach((product) => {
    const {category} = product;
    const isPromo = category === "Promociones";

    if (lastCategory !== category) {
      if (item !== 0 && !isPromo) {
        listItems.push(<Divider key={item++} />);
      }

      listItems.push(
        <Text key={item++} style={styles.category}> {category} </Text>
      );

      lastCategory = category;
    }

    // TODO: mejorar esto, deberíamos tener un dato, en vez de usar
    // el nombre "Promociones"
    listItems.push(
      <Product key={item++} product={product} promo={isPromo} isPreview={isPreview} />
    );
  });

  listItems.push(<Divider key={item++} />);

  return <>{listItems}</>;
};

const styles = StyleSheet.create({
  category: {
    color: colors.brown,
    fontFamily: "Barlow",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
  },
});
