import { useRouter } from "next/router"
import type { SubmitHandler } from "react-hook-form"
import { StyleSheet, View, ViewStyle } from "react-native"
import { useCart } from "react-use-cart"

import Form from "@/components/Cart/Form"
import Header from "@/components/Cart/Header"
import ProductList from "@/components/Cart/ProductList"
import { colors } from "@/lib/colors"
import { extractSections } from "@/lib/utils/products"
import { generateWhatsappURL } from "@/lib/utils/utils"
import type { Product, CartFormValues } from "types"

export default function Cart() {
  const router = useRouter()

  const { items, metadata } = useCart()
  const { slug, orderswhatsappnumber } = metadata
  const cartProducts = items
  const categoriesWithCartProducts = items
  // const categoriesWithCartProducts = extractSections(cartProducts)

  if (!slug) {
    router.push("/")
    return null
  }

  const onSubmit: SubmitHandler<CartFormValues> = (data) => {
    const url = generateWhatsappURL(
      orderswhatsappnumber,
      data,
      categoriesWithCartProducts
    )
    window.location.href = url
  }

  return (
    <View style={styles.container}>
      <Header slug={slug} />

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
