import { StyleSheet, View, ViewStyle } from "react-native"

import { colors } from "@/common/colors"

export default function Divider() {
  return <View style={styles.divider} />
}

type Styles = {
  divider: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  divider: {
    backgroundColor: colors.lightBackground,
    borderBottomWidth: 1,
    borderColor: colors.dividerBorder,
    borderTopWidth: 1,
    height: 10,
    marginBottom: 16,
    marginTop: 16,
    width: "100%",
  },
})
