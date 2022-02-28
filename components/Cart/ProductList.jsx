import { StyleSheet, Text, View } from "react-native"

import Product from "./Product";
import colors from "../../assets/colors";

const ProductList = ({ products, shop }) => {
  const Products = ({ categoryProducts }) => {
    return (
      <View>
        {categoryProducts.map((product) => (
          <Product key={product.id} product={product} shop={shop} />
        ))}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {products.map((category, index) => (
        <View key={index}>
          <Text style={styles.category}>{category.name}</Text>
          <Products categoryProducts={category.products} />
        </View>
      ))}
    </View>
  )
}

export default ProductList

const styles = StyleSheet.create({
  category: {
    color: colors.brown,
    fontFamily: "Barlow",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  container: {
    marginTop: 13,
  },
})
