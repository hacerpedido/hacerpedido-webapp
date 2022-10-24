import { useRouter } from "next/router"
import {
  StyleSheet,
  TouchableHighlight,
  View,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native"

import { buttonStyles } from "@/components/buttonStyles"
import { PhoneCallIcon } from "@/components/icons"
import { colors } from "@/lib/colors"
import { generateCallUrl } from "@/lib/utils/utils"
import { isEmpty, totalItemsAmount } from "store"
import type { Shop } from "types"

type Props = { shop: Shop }

const ShopFooter = ({ shop }: Props) => {
  const { ordersphonenumber = "", orderswhatsappnumber = "" } = shop
  const router = useRouter()
  const statusOpacity = isEmpty() ? { opacity: 0.7 } : { opacity: 1 }
  const isCartEmpty = isEmpty()
  const total = totalItemsAmount()

  const onCall = (phoneNumber: string) =>
    (window.location.href = generateCallUrl(phoneNumber))

  const ButtonWhatsapp = () => (
    <TouchableHighlight
      disabled={isCartEmpty}
      underlayColor={"none"}
      onPress={() => router.push("/cart")}
    >
      <View
        style={[
          buttonStyles.buttonWhatsApp,
          buttonStyles.button,
          statusOpacity,
        ]}
      >
        <Text style={buttonStyles.buttonText}> Revisar mi pedido </Text>
        <View style={s.totalAmountContainer}>
          <Text style={s.totalAmountText}> {total} </Text>
        </View>
      </View>
    </TouchableHighlight>
  )

  const ButtonCall = () => (
    // TODO: Extract component, to be reused in header
    <TouchableHighlight
      onPress={() => onCall(ordersphonenumber)}
      underlayColor={"none"}
    >
      {/* TODO: weird styling on this button */}
      <View style={[buttonStyles.buttonCall, buttonStyles.button]}>
        <Text>
          <PhoneCallIcon color={colors.white} />
          <Text>Llamar</Text>
        </Text>
      </View>
    </TouchableHighlight>
  )

  return (
    <View style={s.container}>
      {orderswhatsappnumber ? <ButtonWhatsapp /> : <ButtonCall />}
    </View>
  )
}

export default ShopFooter

type Styles = {
  container: ViewStyle
  totalAmountContainer: ViewStyle
  totalAmountText: TextStyle
}

// TODO: missing some styles, verify that I havent erase any
const s = StyleSheet.create<Styles>({
  container: {
    backgroundColor: colors.lightBackground,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: 12,
    position: "fixed", //NOTE: there's a RNW bug marking this as an error
    width: "100%",
  },
  totalAmountContainer: {
    alignItems: "center",
    borderColor: colors.white,
    borderRadius: 50,
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
