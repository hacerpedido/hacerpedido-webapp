import dynamic from "next/dynamic"
import { View, ViewStyle, StyleSheet } from "react-native"

import Divider from "@/components/Divider"
import ProductList from "@/components/Shop/ProductList"
import ShopHeader from "@/components/Shop/ShopHeader"
import ShopNotes from "@/components/Shop/ShopNotes"
import { colors } from "@/lib/colors"
import { groupAndSortByCategory } from "@/lib/utils/products"
// NOTE: fixes localstorage ssr issues https://github.com/vercel/next.js/discussions/35773
const ShopFooter = dynamic(() => import("@/components/Shop/ShopFooter"), {
  ssr: false,
})

import type { Shop as ShopType, Product } from "types"

type Props = {
  shop: ShopType
  products: Product[]
  isPreview?: boolean
}

export default function Shop({ shop, products, isPreview = false }: Props) {
  const categoriesWithProducts = groupAndSortByCategory(products)
  // TODO: isPreview could be a valtio state

  const { orderswhatsappnumber } = shop
  return (
    <>
      <ShopHeader isPreview={isPreview} shop={shop} />

      <View style={styles.container}>
        <ShopNotes shop={shop} />
        {categoriesWithProducts.map(({ name, products }, index) => (
          <div key={`productList-${index}`}>
            <ProductList
              category={name}
              products={products}
              isCartEnabled={!!orderswhatsappnumber}
            />

            <Divider />
          </div>
        ))}

        {isPreview || <ShopFooter shop={shop} />}
      </View>
    </>
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
