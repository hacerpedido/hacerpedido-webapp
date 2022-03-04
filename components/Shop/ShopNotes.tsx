import { StyleSheet, View, Text, TextStyle, ViewStyle } from "react-native"

import theme from "@/common/theme"
import type { Shop } from "types"

const ShopNotes = ({ shop }: { shop: Shop }) => {
  if (shop.notes) {
    return (
      <View style={styles.container}>
        <Text style={styles.category}>Notas</Text>
        <Text style={styles.notes}>{shop.notes}</Text>
      </View>
    )
  }

  return null
}

export default ShopNotes

type Styles = {
  category: TextStyle
  container: ViewStyle
  notes: TextStyle
}

const styles = StyleSheet.create<Styles>({
  category: {
    color: theme.colors.brown,
    fontFamily: "Barlow",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 2,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
  },
  container: {
    flex: 1,
    marginBottom: 40,
  },
  notes: {
    color: theme.colors.lightGrey,
    fontFamily: "Roboto Slab",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    marginBottom: 2,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
  },
})
