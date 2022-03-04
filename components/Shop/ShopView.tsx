import { StyleSheet, ScrollView, View, ViewStyle } from "react-native"
import { useSelector } from "react-redux"

import colors from "../../assets/colors"

import type { Shop, Product } from "../../types"
import Loading from "../Loading"

import ProductList from "./ProductList"
import ShopHeader from "./ShopHeader"
import ShopNotes from "./ShopNotes"

type Props = {
  isPreview?: boolean
  shop: Shop
  previewProducts?: Product[]
}

export default function ShopView({
  isPreview = false,
  shop,
  previewProducts = [],
}: Props) {
  // TODO: se esta renderizando 2 veces todo el componente. Deberia renderizar solo el prodlist?
  const isLoading = useSelector((state) => state.app.loading)
  const isCartEnabled = !isPreview && shop?.orderswhatsappnumber.length > 0
  const products = isPreview
    ? previewProducts
    : useSelector((state) => state.shop.products)

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
