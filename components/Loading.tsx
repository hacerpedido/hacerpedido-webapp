import { ActivityIndicator, StyleSheet, ViewStyle } from "react-native"

import colors from "../assets/colors"

export default function Loading() {
  return (
    <ActivityIndicator
      size="large"
      color={colors.orangeHP}
      style={styles.default}
    />
  )
}

type Styles = {
  default: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  default: {
    margin: 30,
  },
})
