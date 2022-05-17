import type { ReactNode } from "react"
import { StyleSheet, Text, ViewStyle } from "react-native"

import { colors } from "@/lib/colors"

import Divider from "components/Divider"
import Product from "components/Shop/Product"
import type { Product as ProductType } from "types"

type Props = {
  products: ProductType[]
  isCartEnabled?: boolean
}

// TODO: Merge with cart/productList.jsx
export default function ProductList({
  products,
  isCartEnabled = false,
}: Props) {
  const listItems: ReactNode[] = []
  let lastCategory = ""
  let item = 0

  // NOTE: refactor once we have a categories DB table
  products.forEach((product: ProductType, index) => {
    const { category } = product

    // TODO: mejorar esto, deberíamos tener un dato, en vez de usar el nombre "Promociones"
    const isPromo = category === "Promociones"

    // If category changed
    if (lastCategory !== category) {
      // Push a divider component if category not promotion type
      if (!isPromo) listItems.push(<Divider key={item++} />)

      // Push a category component
      listItems.push(
        <Text key={item++} style={styles.category}>
          {category}
        </Text>
      )

      lastCategory = category
    }

    // Push a product
    listItems.push(
      <Product
        key={item++}
        product={product}
        promo={isPromo}
        isCartEnabled={isCartEnabled}
      />
    )
  })

  // Push a divider
  listItems.push(<Divider key={item++} />)

  return <>{listItems}</>
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
