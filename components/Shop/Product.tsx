import { useEffect, useState, useRef } from "react"
import {
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  TextStyle,
  ViewStyle,
} from "react-native"

import ProductAmountPopup from "@/components/Shop/ProductAmountPopup"
import { colors } from "@/lib/colors"
import { getItems } from "store"

import type { Product as ProductType } from "types"

type Props = {
  product: ProductType
  promo?: boolean
  isCartEnabled?: boolean
}

const Product = ({ product, promo = false, isCartEnabled = false }: Props) => {
  const ref = useRef(null)
  const [popupVisible, setPopupVisible] = useState(false)
  const { id, name, description, price } = product
  const items = getItems()
  const item = items.find((item) => item.id === id)

  // TODO: Move to productamountpopup?
  useEffect(() => {
    const listener = (event: TouchEvent | MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target))
        setPopupVisible(false)
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, setPopupVisible, item])

  const containerStyle = promo ? s.card : s.product

  return (
    <div ref={ref}>
      <TouchableHighlight
        onPress={() => setPopupVisible(!popupVisible)}
        underlayColor={"none"}
      >
        <View style={[s.container, containerStyle]}>
          <View style={s.nameDescription}>
            <Text style={s.name}>
              {name}

              {item?.quantity > 0 && (
                <View style={s.amountContainer}>
                  <Text style={s.amountText}>{item.quantity}</Text>
                </View>
              )}
            </Text>
            <Text style={s.description}>{description}</Text>
          </View>

          <Text style={s.price}>{price && `$${price}`}</Text>

          {isCartEnabled && (
            <View style={s.buttonQty}>
              <Text style={s.buttonQtyText}>+</Text>

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

const s = StyleSheet.create<Styles>({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 52,
  },
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
    marginLeft: 16,
    marginRight: 16,
    marginTop: 15,
    paddingBottom: 10,
    paddingRight: 10,
  },
})
