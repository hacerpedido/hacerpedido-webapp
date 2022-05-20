import { StyleSheet, Text, ViewStyle, View } from "react-native"

import Product from "@/components/Shop/Product"
import { colors } from "@/lib/colors"
import type { Product as ProductType } from "types"

type Props = {
  products: ProductType[]
  category: string
  isCartEnabled?: boolean
}

// TODO: Merge with cart/productList.jsx
export default function ProductList({
  products,
  category,
  isCartEnabled = false,
}: Props) {
  return (
    <View>
      <Text style={styles.category}>{category}</Text>
      {products.map((product: ProductType) => (
        <Product
          key={product.id}
          product={product}
          promo={category == "Promociones"}
          isCartEnabled={isCartEnabled}
        />
      ))}
    </View>
  )
}

type Styles = {
  category: ViewStyle
}

const styles = StyleSheet.create<Styles>({
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
})
