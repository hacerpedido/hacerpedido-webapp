import { StyleSheet, View, Text, TextStyle, ViewStyle } from "react-native"

import theme from "@/lib/theme"
import type { Shop } from "types"

const ShopNotes = ({ shop }: { shop: Shop }) => {
  if (shop.notes) {
    return (
      <View>
        <Text style={s.category}>Notas</Text>
        <Text style={s.notes}>{shop.notes}</Text>
      </View>
    )
  }

  return null
}

export default ShopNotes

// TODO: add some margin to separate from header
type Styles = {
  category: TextStyle
  notes: TextStyle
}

const s = StyleSheet.create<Styles>({
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
  notes: {
    color: theme.colors.lightGrey,
    fontFamily: "Roboto Slab",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
  },
})
