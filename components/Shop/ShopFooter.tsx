// TODO: missing some styles, verify that I havent erase any
import { useRouter } from "next/router"
import {
  StyleSheet,
  TouchableHighlight,
  View,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native"
import { useSelector } from "react-redux"

import colors from "../../assets/colors"
import { PhoneCallIcon } from "../../assets/icons"
import type { RootState } from "../../lib/reducers"
import { generateCallUrl } from "../../lib/utils/utils"
import type { Shop } from "../../types"

type Props = {
  shop: Shop
}

const ShopFooter = ({ shop }: Props) => {
  const { ordersphonenumber = "", orderswhatsappnumber = "" } = shop
  const router = useRouter()
  const totalAmount = useSelector((state: RootState) => state.shop.totalAmount)
  const statusOpacity = totalAmount ? { opacity: 1 } : { opacity: 0.7 }

  const ButtonWhatsapp = () => (
    <TouchableHighlight
      disabled={!totalAmount}
      underlayColor={"none"}
      onPress={() => router.push("/cart")}
      style={styles.buttonContainer}
    >
      <View style={[styles.buttonWhatsApp, styles.button, statusOpacity]}>
        <Text style={styles.buttonText}> Revisar mi pedido </Text>
        <View style={styles.totalAmountContainer}>
          <Text style={styles.totalAmountText}> {totalAmount} </Text>
        </View>
      </View>
    </TouchableHighlight>
  )

  const onCall = (phoneNumber: string) =>
    (window.location.href = generateCallUrl(phoneNumber))

  const ButtonCall = () => (
    // TODO: Extract component, to be reused in header
    <TouchableHighlight
      onPress={() => onCall(ordersphonenumber)}
      underlayColor={"none"}
      style={styles.buttonContainer}
    >
      <View style={[styles.buttonCall, styles.button]}>
        <Text numberOfLines={1}>
          <PhoneCallIcon color={colors.white} />
          <Text>Llamar</Text>
        </Text>
      </View>
    </TouchableHighlight>
  )

  return (
    <View style={styles.container}>
      {orderswhatsappnumber ? <ButtonWhatsapp /> : <ButtonCall />}
    </View>
  )
}

export default ShopFooter

type Styles = {
  button: ViewStyle
  buttonCall: ViewStyle
  buttonContainer: ViewStyle
  buttonText: TextStyle
  buttonWhatsApp: ViewStyle
  container: ViewStyle
  totalAmountContainer: ViewStyle
  totalAmountText: TextStyle
}

const styles = StyleSheet.create<Styles>({
  button: {
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    height: 50,
    justifyContent: "center",
    marginHorizontal: 18,
    marginTop: 12,
    textAlign: "center",
  },
  buttonCall: {
    backgroundColor: colors.orangeHP,
    borderColor: colors.filterButtonBorder,
  },
  buttonContainer: {
    flex: 1,
  },
  buttonText: {
    color: colors.white,
    flex: 1,
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  buttonWhatsApp: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.button1,
  },
  container: {
    backgroundColor: colors.lightBackground,
    bottom: 0,
    flex: 1,
    flexDirection: "row",
    height: 100,
    position: "fixed",
    width: "100%",
  },
  totalAmountContainer: {
    alignItems: "center",
    borderColor: colors.white,
    borderRadius: "50%",
    borderWidth: 1.5,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    top: 13,
    width: 24,
  },
  totalAmountText: {
    color: colors.white,
    fontFamily: "Barlow",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 1,
  },
})
