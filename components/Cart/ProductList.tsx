import { StyleSheet, Text, TextStyle } from "react-native"

import Product from "@/components/Cart/Product"
import { colors } from "@/lib/colors"
import type { Product as ProductType } from "types"

type Props = {
  category: string
  products: ProductType[]
}
const ProductList = ({ category, products }: Props) => {
  return (
    <>
      <Text style={styles.category}>{category}</Text>

      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </>
  )
}

export default ProductList

type Styles = {
  category: TextStyle
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
