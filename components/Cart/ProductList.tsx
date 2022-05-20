import { StyleSheet, Text, View, TextStyle, ViewStyle } from "react-native"

import Product from "@/components/Cart/Product"
import { colors } from "@/lib/colors"
import type { Product as ProductType } from "types"

const ProductList = ({ category, products }) => {
  return (
    <View>
      <Text style={styles.category}>{category}</Text>
      {products.map((product: ProductType) => (
        <Product key={product.id} product={product} />
      ))}
    </View>
  )
}

export default ProductList

type Styles = {
  category: TextStyle
  container: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  category: {
    color: colors.brown,
    fontFamily: "Barlow",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
})
