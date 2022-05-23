import { useState, useEffect } from "react"

import {
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from "react-native"
import { animated, config, useTransition } from "react-spring"

import { colors } from "@/lib/colors"
import {
  getItem,
  getItems,
  updateItemQuantity,
  addItem,
  removeItem,
} from "store"

import type { Product } from "types"

type Props = {
  product: Product
  visible: boolean
  handleClose: () => void
}

const ProductAmountPopup = ({ product, visible, handleClose }: Props) => {
  const { id } = product
  const items = getItems()
  const item = items.find((item) => item.id === id)
  const [quantity, setQuantity] = useState(0)

  useEffect(() => {
    if (item) setQuantity(item?.quantity)
  }, [item])

  // TODO: https://react-spring.io/hooks/use-transition
  const transitions = useTransition(visible, {
    from: { opacity: 0, transform: "scale(0, 0)" },
    enter: { opacity: 1, transform: "scale(1, 1)" },
    leave: { opacity: 0, transform: "scale(0, 0)" },
    config: config.stiff,
  })

  const AnimatedView = animated(View)

  // TODO: not updating the value in the UI
  const updateAmount = () => {
    // TODO: RFC
    if (item) {
      if (quantity < 1) {
        removeItem(id)
      } else {
        updateItemQuantity(id, quantity)
      }
    } else {
      if (quantity > 0) {
        addItem(product, quantity)
      }
    }

    handleClose()
  }

  return transitions(
    (transitionStyle, item) =>
      item && (
        <AnimatedView style={transitionStyle}>
          <View style={styles.container}>
            <TouchableHighlight
              onPress={() => quantity > 0 && setQuantity(quantity - 1)}
              underlayColor={"none"}
            >
              <View style={styles.buttonQty}>
                <Text style={styles.buttonQtyText}>-</Text>
              </View>
            </TouchableHighlight>

            <Text style={styles.amountText}>{quantity}</Text>

            <TouchableHighlight
              underlayColor={"none"}
              onPress={() => setQuantity(quantity + 1)}
            >
              <View style={[styles.buttonQty, styles.buttonPlus]}>
                <Text style={[styles.buttonQtyText, styles.buttonPlusText]}>
                  +
                </Text>
              </View>
            </TouchableHighlight>

            <View style={styles.lineBreak} />

            <TouchableHighlight
              onPress={() => updateAmount()}
              underlayColor={"none"}
            >
              <View style={styles.buttonSubmit}>
                <Text style={styles.buttonSubmitText}>Agregar</Text>
              </View>
            </TouchableHighlight>

            <View style={styles.lineBreak} />

            <TouchableHighlight onPress={handleClose} underlayColor={"none"}>
              <View style={styles.closeButton}>
                <Text style={styles.closeButtonIcon}>+</Text>
              </View>
            </TouchableHighlight>
          </View>
        </AnimatedView>
      )
  )
}

export default ProductAmountPopup

const shadowColor = "rgba(0, 0, 0, 0.2)"

type Styles = {
  amountText: TextStyle
  buttonPlus: ViewStyle
  buttonPlusText: TextStyle
  buttonQty: ViewStyle
  buttonQtyText: ViewStyle
  buttonSubmit: ViewStyle
  buttonSubmitText: TextStyle
  closeButton: ViewStyle
  closeButtonIcon: TextStyle
  container: ViewStyle
  lineBreak: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  amountText: {
    fontFamily: "Barlow",
    fontSize: 20,
    marginHorizontal: 17,
  },
  buttonPlus: {
    backgroundColor: colors.orangeHP,
    borderColor: colors.orangeHP,
  },
  buttonPlusText: {
    color: colors.white,
  },
  buttonQty: {
    alignItems: "center",
    borderColor: colors.gray4,
    borderRadius: 50,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    // marginHorizontal: 17,
    width: 28,
  },
  buttonQtyText: {
    color: colors.gray4,
    fontFamily: "Barlow",
    fontSize: 20,
    fontWeight: "600",
    paddingBottom: 2,
  },
  buttonSubmit: {
    backgroundColor: colors.orangeHP,
    borderRadius: 3.4,
    marginTop: 17,
  },
  buttonSubmitText: {
    color: colors.white,
    fontFamily: "Barlow",
    fontWeight: "600",
    lineHeight: 18,
    paddingBottom: 5.5,
    paddingHorizontal: 24,
    paddingTop: 4.5,
  },
  closeButton: {
    backgroundColor: colors.white,
    borderColor: colors.lightGrey3,
    borderRadius: 2,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
    borderWidth: 1,
    bottom: -20,
    height: 20,
    left: 57,
    position: "relative",
    width: 20,
  },
  closeButtonIcon: {
    color: colors.lightGreen,
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "600",
    transform: "rotate(-45deg)",
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderBottomRightRadius: 0,
    borderColor: colors.lightGrey3,
    borderRadius: 5.6,
    borderWidth: 1,
    bottom: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingTop: 16,
    position: "absolute",
    right: -1,
    shadowColor: shadowColor,
    shadowOffset: { width: 1.14, height: 5.55 },
    shadowRadius: 10,
    width: 135,
    zIndex: 9999,
  },
  lineBreak: { width: "100%" },
})
