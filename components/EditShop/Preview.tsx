import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import theme from "@/common/theme"
import ShopView from "components/Shop/ShopView"
import type { Product, Shop } from "types"

type Props = {
  products: Product[]
  shop: Shop
  isLoading: boolean
  tempShop: Shop
}
const Preview = ({ products, shop, isLoading, tempShop }: Props) => (
  <View style={styles.rightContainer}>
    <a
      href={`/${shop.slug}`}
      // style={styles.openProductionLink}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Text style={styles.openProductionLinkText}>
        Ir a mi Sitio
        <Image
          source={{ uri: "/images/external-link-alt.png" }}
          // style={styles.openProductionLinkIcon}
          alt="Ir a mi sitio"
        />
      </Text>
    </a>

    <ShopView
      products={products}
      shop={tempShop}
      isLoading={isLoading}
      isPreview={true}
    />
  </View>
)

type Styles = {
  rightContainer: ViewStyle
  openProductionLink: TextStyle
  openProductionLinkText: TextStyle
  openProductionLinkIcon: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  rightContainer: {
    backgroundColor: theme.colors.lightGrey2,
    padding: 30,
    width: 400,
  },
  openProductionLink: {
    paddingBottom: 30,
    textAlign: "center",
    textDecoration: "none",
  },
  openProductionLinkText: {
    color: theme.colors.button1,
    fontFamily: "Barlow",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "600",
  },
  openProductionLinkIcon: {
    height: 16,
    margin: 3,
    top: 4,
    width: 18,
  },
})

export default Preview
