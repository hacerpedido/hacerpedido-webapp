import { useRouter } from "next/router"
import type { SubmitHandler } from "react-hook-form"
import { StyleSheet, View, ViewStyle } from "react-native"

import Form from "@/components/Cart/Form"
import Header from "@/components/Cart/Header"
import ProductList from "@/components/Cart/ProductList"
import { colors } from "@/lib/colors"
import { useAppSelector as useSelector } from "@/lib/hooks"
import { extractSections } from "@/lib/utils/products"
import { generateWhatsappURL } from "@/lib/utils/utils"
import type { Product, CartFormValues } from "types"

export default function Cart() {
  const router = useRouter()

  const shop = useSelector((state) => state.shop.shop)
  const products = useSelector((state) => state.shop.products)
  const cartProducts = products.filter((p: Product) => p.amount > 0)
  const categoriesWithCartProducts = extractSections(cartProducts)

  if (!shop) {
    router.push("/")
    return null
  }

  const onSubmit: SubmitHandler<CartFormValues> = (data) => {
    const { orderswhatsappnumber } = shop
    const url = generateWhatsappURL(
      orderswhatsappnumber,
      data,
      categoriesWithCartProducts
    )
    window.location.href = url
  }

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.bodyContainer}>
        <ProductList categoriesWithCartProducts={categoriesWithCartProducts} />
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
