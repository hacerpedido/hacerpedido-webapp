import { StyleSheet, ScrollView, View } from "react-native"
import { useSelector } from "react-redux"

import colors from "../../assets/colors";

import Loading from "../Loading"

import ProductList from "./ProductList"
import ShopHeader from "./ShopHeader"
import ShopNotes from "./ShopNotes"

export default function ShopView({
  isPreview = false,
  shop,
  previewProducts = [],
}) {
  // TODO: se esta renderizando 2 veces todo el componente. Deberia renderizar solo el prodlist?
  const isLoading = useSelector((state) => state.app.loading)
  const isCartEnabled = !isPreview && shop && shop.orderswhatsappnumber
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: 130,
  },
})
