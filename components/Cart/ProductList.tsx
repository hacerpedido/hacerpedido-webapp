import { StyleSheet, Text, View, TextStyle, ViewStyle } from "react-native"

import colors from "../../assets/colors"

import type { CartProduct, CategoryWithProducts } from "../../types"

import Product from "./Product"

type Props = {
  productsByCategory: CategoryWithProducts[]
}
// NOTE: productsByCategory type is {name: string, products: ProductType[]}

const ProductList = ({ productsByCategory }: Props) => {
  const Products = ({ products }: { products: CartProduct[] }) => {
    return (
      <View>
        {products.map((product: CartProduct) => (
          <Product key={product.id} product={product} />
        ))}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {productsByCategory.map((category, index) => (
        <View key={index}>
          <Text style={styles.category}>{category.name}</Text>
          <Products products={category.products} />
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
