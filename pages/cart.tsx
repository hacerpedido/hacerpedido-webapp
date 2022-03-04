import { useRouter } from "next/router"
import { StyleSheet, View, ViewStyle } from "react-native"
import { useSelector } from "react-redux"

import { colors } from "../assets/colors"
import Form from "../components/Cart/Form"
import Header from "../components/Cart/Header"
import ProductList from "../components/Cart/ProductList"
import { extractSections } from "../lib/utils/products"
import { generateWhatsappURL } from "../lib/utils/utils"
import type { CartProduct } from "../types"

export default function Cart() {
  const router = useRouter()

  const shop = useSelector((state) => state.shop.shop)
  let products = useSelector((state) => state.shop.products)
  products = products.filter((p: CartProduct) => p.amount > 0)
  const productsByCategory = extractSections(products)

  if (!shop) {
    router.push("/")
    return null
  }

  const onSubmit = (data) => {
    const { orderswhatsappnumber } = shop
    const url = generateWhatsappURL(
      orderswhatsappnumber,
      data,
      productsByCategory
    )
    window.location.href = url
  }

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.bodyContainer}>
        <ProductList productsByCategory={productsByCategory} />
        <Form onSubmit={onSubmit} />
      </View>
    </View>
  )
}

type Styles = {
  bodyContainer: ViewStyle
  container: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  bodyContainer: {
    marginHorizontal: 24,
  },
  container: {
    backgroundColor: colors.white,
  },
})
