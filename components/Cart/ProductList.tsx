import { StyleSheet, Text, View, TextStyle, ViewStyle } from "react-native"

import { colors } from "@/common/colors"
import Product from "@/components/Cart/Product"
import type { Product as ProductType, CategoryWithProducts } from "types"

type Props = {
  categoriesWithCartProducts: CategoryWithProducts[]
}

const ProductList = ({ categoriesWithCartProducts }: Props) => {
  return (
    <View style={styles.container}>
      {categoriesWithCartProducts.map((category, index) => (
        <View key={index}>
          <Text style={styles.category}>{category.name}</Text>
          {category.products.map((product: ProductType) => (
            <Product key={product.id} product={product} />
          ))}
        </View>
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
  container: {
    marginTop: 13,
  },
})
