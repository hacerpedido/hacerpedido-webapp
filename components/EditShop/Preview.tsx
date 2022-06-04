import ShopView from "components/Shop/ShopView"
import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  View,
  Linking,
  ViewStyle,
} from "react-native"

import theme from "@/lib/theme"
import type { Product, Shop } from "types"

type Props = {
  shop: Shop
  products: Product[]
  isLoading: boolean
}
const Preview = ({ shop, products, isLoading }: Props) => (
  <View style={styles.rightContainer}>
    <View style={styles.openProductionLinkContainer}>
      <Text
        onPress={() => Linking.openURL(`/${shop.slug}`)}
        style={styles.openProductionLinkText}
      >
        Ir a mi Sitio
        <Image
          source={{ uri: "/images/external-link-alt.png" }}
          style={styles.openProductionLinkIcon}
          alt="Ir a mi sitio"
        />
      </Text>
    </View>

    <ShopView
      shop={shop}
      products={products}
      isLoading={isLoading}
      isPreview={true}
    />
  </View>
)

type Styles = {
  rightContainer: ViewStyle
  openProductionLinkContainer: ViewStyle
  openProductionLinkText: TextStyle
  openProductionLinkIcon: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  rightContainer: {
    backgroundColor: theme.colors.lightGrey2,
    padding: 30,
    width: 400,
  },
  openProductionLinkContainer: {
    paddingBottom: 30,
    textAlign: "center",
  },
  openProductionLinkText: {
    color: theme.colors.button1,
    fontFamily: "Barlow",
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
