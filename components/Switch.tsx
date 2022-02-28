import {
  StyleSheet,
  View,
  ViewStyle,
  Switch as RNSwitch,
  Text,
} from "react-native"

import { colors } from "../assets/colors"

type Props = {
  onToggle: () => void
  value: boolean
}

const Switch = ({ onToggle, value }: Props) => {
  return (
    <View style={styles.container}>
      <Text>Delivery</Text>

      <RNSwitch
        trackColor={colors.lightGray}
        thumbColor={colors.lightGray}
        activeTrackColor={colors.lightGreen}
        activeThumbColor={colors.lightGreen}
        onValueChange={onToggle}
        style={styles.switch}
        value={value}
      />

      <Text>Takeaway</Text>
    </View>
  )
}

// https://upmostly.com/tutorials/build-a-react-switch-toggle-component
export default Switch

type Styles = {
  container: ViewStyle
  switch: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  switch: {
    marginHorizontal: 7,
  },
})
