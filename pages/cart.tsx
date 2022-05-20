import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import type { SubmitHandler } from "react-hook-form"
import { StyleSheet, View, ViewStyle } from "react-native"

import Form from "@/components/Cart/Form"
import Header from "@/components/Cart/Header"
import ProductList from "@/components/Cart/ProductList"
import { colors } from "@/lib/colors"
import { groupAndSortByCategory } from "@/lib/utils/products"
import { generateWhatsappURL } from "@/lib/utils/utils"
import { getShop, getItems } from "store"
import type { CartFormValues } from "types"

function Cart() {
  const router = useRouter()
  const shop = getShop()
  const { slug, orderswhatsappnumber } = shop

  if (!slug) {
    router.push("/")
    return null
  }

  const cartProducts = getItems()
  const groupedCategories = groupAndSortByCategory(cartProducts)

  const onSubmit: SubmitHandler<CartFormValues> = (data) => {
    const url = generateWhatsappURL(
      orderswhatsappnumber,
      data,
      groupedCategories
    )

    window.location.href = url
  }

  return (
    <View style={styles.container}>
      <Header slug={slug} />

      <View style={styles.bodyContainer}>
        <View style={styles.categoryContainer}>
          {groupedCategories.map(({ category, products }) => (
            <ProductList
              key={category}
              category={category}
              products={products}
            />
          ))}
          <Form onSubmit={onSubmit} />
        </View>
      </View>
    </View>
  )
}

type Styles = {
  bodyContainer: ViewStyle
  container: ViewStyle
  categoryContainer: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  bodyContainer: {
    marginHorizontal: 24,
  },
  container: {
    backgroundColor: colors.white,
  },
  categoryContainer: {
    marginTop: 13,
  },
})

export default dynamic(() => Promise.resolve(Cart), {
  ssr: false,
})
