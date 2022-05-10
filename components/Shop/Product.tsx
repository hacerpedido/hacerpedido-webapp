import { useEffect, useState, useRef } from "react"
import {
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  TextStyle,
  ViewStyle,
} from "react-native"

import { colors } from "@/common/colors"
import { sanitizePrice } from "@/common/utils/utils"
import ProductAmountPopup from "@/components/Shop/ProductAmountPopup"

import type { Product as ProductType } from "types"

type Props = {
  product: ProductType
  promo?: boolean
  isCartEnabled?: boolean
}

const Product = ({ product, promo = false, isCartEnabled = false }: Props) => {
  const ref = useRef(null)
  const [popupVisible, setPopupVisible] = useState(false)
  const { name, description, price = "", amount = 0 } = product

  // TODO: Move to productamountpopup?
  useEffect(() => {
    const listener = (event: TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target))
        setPopupVisible(false)
    }
    document.addEventListener("touchend", listener)

    return () => {
      document.removeEventListener("touchend", listener)
    }
  }, [ref, setPopupVisible])

  const displayPrice = sanitizePrice(price)
  const containerStyle = promo ? styles.card : styles.product

  return (
    <div ref={ref}>
      <TouchableHighlight
        onPress={() => setPopupVisible(!popupVisible)}
        underlayColor={"none"}
      >
        <View style={[styles.container, containerStyle]}>
          <View style={styles.nameDescription}>
            <Text style={styles.name}>
              {name}

              {amount > 0 && (
                <View style={styles.amountContainer}>
                  <Text style={styles.amountText}>{amount}</Text>
                </View>
              )}
            </Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <Text style={styles.price}>{displayPrice && `$${displayPrice}`}</Text>

          {isCartEnabled && (
            <View style={styles.buttonQty}>
              <Text style={styles.buttonQtyText}>+</Text>

              <ProductAmountPopup
                product={product}
                visible={popupVisible}
                handleClose={() => setPopupVisible(false)}
              />
            </View>
          )}
        </View>
      </TouchableHighlight>
    </div>
  )
}

export default Product

type Styles = {
  amountContainer: ViewStyle
  amountText: TextStyle
  buttonQty: ViewStyle
  buttonQtyText: TextStyle
  card: ViewStyle
  container: ViewStyle
  description: TextStyle
  name: TextStyle
  nameDescription: TextStyle
  price: TextStyle
  product: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  amountContainer: {
    alignItems: "center",
    backgroundColor: colors.orangeHP,
    borderRadius: 3,
    borderWidth: 0,
    height: 20,
    justifyContent: "center",
    marginLeft: 11,
    width: 20,
  },
  amountText: {
    color: colors.white,
    fontFamily: "Barlow",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonQty: {
    borderColor: colors.lightGreen,
    borderRadius: 2,
    borderWidth: 1,
    height: 20,
    justifyContent: "center",
    marginLeft: 11,
    textAlign: "center",
    width: 20,
  },
  buttonQtyText: {
    color: colors.lightGreen,
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 20,
    paddingBottom: 2,
  },
  card: {
    borderColor: colors.cardBorder,
    borderRadius: 7,
    borderWidth: 1,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 52,
  },
  description: {
    flex: 1,
    flexWrap: "wrap",
    color: colors.lightGrey,
    fontFamily: "Roboto Slab",
    fontSize: 13,
    lineHeight: 17,
  },
  name: {
    flex: 1,
    flexWrap: "wrap",
    fontFamily: "Barlow",
    fontWeight: "600",
    color: colors.brown,
    fontSize: 15,
    lineHeight: 18,
    marginBottom: 5,
  },
  nameDescription: {
    flex: 1,
  },
  price: {
    color: colors.green,
    fontFamily: "Barlow",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
  },
  product: {
    borderBottomWidth: 1,
    borderColor: colors.dividerBorder,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 15,
    paddingBottom: 10,
    paddingRight: 10,
  },
})
