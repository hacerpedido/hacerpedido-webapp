import { useRouter } from "next/router"
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TextStyle,
  ViewStyle,
} from "react-native"

import { colors } from "../../assets/colors"
import { ArrowLeftIcon } from "../../assets/icons"
import { useAppSelector } from "../../lib/hooks"

export default function CartHeader() {
  const cart = useAppSelector((state) => state.shop)
  const slug = cart.shop.slug

  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.containerNavigator}>
        <TouchableHighlight
          onPress={() => router.push(`/${slug}`)}
          underlayColor="none"
          style={styles.buttonBack}
        >
          <ArrowLeftIcon />
        </TouchableHighlight>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Revisar mi Pedido</Text>
      </View>
    </View>
  )
}

const barlow = { fontFamily: "Barlow" }
const xlargeText = 19

const textStyles = {
  xlargeText: {
    ...barlow,
    fontSize: xlargeText,
    fontWeight: "600",
    lineHeight: 23,
  },
}

type Styles = {
  buttonBack: ViewStyle
  container: ViewStyle
  containerNavigator: ViewStyle
  title: TextStyle
  titleContainer: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  buttonBack: {
    left: 0,
    padding: 24,
    position: "absolute",
    top: 0,
  },
  container: {},
  containerNavigator: {
    color: colors.brown,
    flexDirection: "row",
    zIndex: 2,
  },
  title: {
    color: colors.brown,
  },
  titleContainer: {
    alignItems: "center",
    borderBottomColor: colors.gray1,
    borderBottomWidth: 2,
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 23,
    paddingTop: 21,
    ...textStyles.xlargeText,
  },
})
