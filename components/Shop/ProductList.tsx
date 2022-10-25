import { StyleSheet, Text, ViewStyle, View } from "react-native"

import Product from "@/components/Shop/Product"
import { colors } from "@/lib/colors"
import type { Product as ProductType } from "types"

type Props = {
  products: ProductType[]
  category: string
  isCartEnabled?: boolean
}

function Divider() {
  return <View style={s.divider}></View>
}

// TODO: Merge with cart/productList.jsx
export default function ProductList({
  products,
  category,
  isCartEnabled = false,
}: Props) {
  return (
    <View>
      <Text style={s.category}>{category}</Text>

      {products.map((product, i, arr) => (
        <div key={product.id}>
          <Product
            key={product.id}
            product={product}
            promo={category == "Promociones"}
            isCartEnabled={isCartEnabled}
          />

          {i != arr.length - 1 && <Divider />}
        </div>
      ))}
    </View>
  )
}

type Styles = {
  category: ViewStyle
  divider: ViewStyle
}

const s = StyleSheet.create<Styles>({
  category: {
    color: colors.brown,
    fontFamily: "Barlow",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: colors.dividerBorder,
  },
})
