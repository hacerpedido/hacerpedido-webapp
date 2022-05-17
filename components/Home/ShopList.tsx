import { StyleSheet, ViewStyle, TextStyle, View, Text } from "react-native"

import ShopCard from "@/components/Home/ShopCard"
import { colors } from "@/lib/colors"
import type { Shop } from "types"

type Props = {
  shops: Shop[]
}

const ShopList = ({ shops }: Props) => {
  const count = shops.length
  const shopText = count === 1 ? "comercio" : "comercios"
  const countText = count === 0 ? "No hay" : count

  return (
    <View style={styles.list}>
      <Text style={styles.count}>
        {countText} {shopText}
      </Text>

      {shops.map((item) => (
        <ShopCard key={item.id} shop={item} />
      ))}
    </View>
  )
}

type Styles = {
  count: TextStyle
  list: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  count: {
    color: colors.lightGrey,
    fontFamily: "Barlow",
    fontSize: 14,
    fontWeight: "400",
    marginVertical: 15,
  },
  list: {
    height: "100vh",
  },
})

export default ShopList
