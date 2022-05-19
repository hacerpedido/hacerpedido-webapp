import { StyleSheet, Text, View, TextStyle, ViewStyle } from "react-native"
import { useCart } from "react-use-cart"

import { colors } from "@/lib/colors"
import type { Product as ProductType } from "types"

const Product = ({ product }: { product: ProductType }) => {
  const { getItem } = useCart()
  const { id, description, name } = product
  const { quantity } = getItem(id)

  return (
    <View style={styles.container}>
      <Text style={styles.amount}>{quantity}</Text>

      <View style={styles.nameDescription}>
        <Text>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  )
}

export default Product

const normalText = {
  fontFamily: "Barlow",
  fontSize: 15,
}

const textStyles = {
  normalBoldText: {
    ...normalText,
    fontWeight: "bold",
  },
  normalSemiBoldText: {
    ...normalText,
    fontWeight: 500,
  },
}

type Styles = {
  amount: TextStyle
  container: ViewStyle
  description: TextStyle
  nameDescription: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  amount: {
    ...textStyles.normalBoldText,
    color: colors.brown,
    marginRight: 9,
  },
  container: {
    // alignItems: "center",
    flexDirection: "row",
    marginBottom: 9,
  },
  description: {
    color: colors.lightGrey,
    fontSize: 13,
    fontFamily: "Roboto Slab",
    lineHeight: 17,
  },
  nameDescription: {
    color: colors.brown,
    flex: 1,
    ...textStyles.normalSemiBoldText,
  },
})
