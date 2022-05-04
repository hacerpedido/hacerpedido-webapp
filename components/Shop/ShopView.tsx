import { StyleSheet, ScrollView, View, ViewStyle } from "react-native"

import Loading from "../Loading"

import ProductList from "./ProductList"
import ShopHeader from "./ShopHeader"
import ShopNotes from "./ShopNotes"

import { colors } from "@/common/colors"

import type { Shop, Product } from "types"

type Props = {
  isPreview?: boolean
  shop: Shop
  isLoading: boolean
  products: Product[]
}

export default function ShopView({
  isPreview = false,
  shop,
  isLoading,
  products,
}: Props) {
  // TODO: se esta renderizando 2 veces todo el componente. Deberia renderizar solo el prodlist?
  const isCartEnabled = !isPreview && shop?.orderswhatsappnumber.length > 0
  console.log(products)

  return (
    <ScrollView>
      <ShopHeader isPreview={isPreview} shop={shop} />

      <View style={styles.container}>
        {!isPreview && isLoading ? (
          <Loading />
        ) : (
          <>
            {products.length && (
              <>
                <ProductList
                  products={products}
                  isCartEnabled={isCartEnabled}
                />
                <ShopNotes shop={shop} />
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  )
}

type Styles = {
  container: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: colors.white,
    marginBottom: 130,
  },
})
