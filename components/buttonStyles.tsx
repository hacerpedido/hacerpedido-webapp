import { StyleSheet, TextStyle, ViewStyle } from "react-native"

import { colors } from "@/lib/colors"

type Styles = {
  button: ViewStyle
  buttonCall: ViewStyle
  buttonText: TextStyle
  buttonWhatsApp: ViewStyle
}
export const buttonStyles = StyleSheet.create<Styles>({
  button: {
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 12,
    textAlign: "center",
    height: 50,
  },
  buttonWhatsApp: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.button1,
  },
  buttonText: {
    color: colors.white,
    flex: 1,
    fontFamily: "Barlow",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonCall: {
    backgroundColor: colors.orangeHP,
    borderColor: colors.filterButtonBorder,
  },
})
