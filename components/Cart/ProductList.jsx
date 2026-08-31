import React from "react";
import { Text, View } from "react-native";

import Product from "./Product";
import styles from "./ProductList.module.css";

const ProductList = ({ products, shop }) => {
  const Products = ({ categoryProducts }) => {
    return (
      <View>
        {categoryProducts.map((product) => (
          <Product key={product.id} product={product} shop={shop} />
        ))}
      </View>
    );
  };

  return (
    <View classList={[styles.container]}>
      {products.map((category, index) => (
        <View key={index}>
          <Text classList={[styles.category]}>{category.name}</Text>
          <Products categoryProducts={category.products} />
        </View>
      ))}
    </View>
  );
};

export default ProductList;
