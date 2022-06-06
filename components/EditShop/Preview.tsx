import { Image, StyleSheet, Text, View } from "react-native"

import Shop from "components/Shop/Shop"
import theme from "lib/theme"

export default function Preview({ shop, products }) {
  const openProductionLink = {
    paddingBottom: 30,
    textAlign: "center",
    textDecoration: "none",
  }

  return (
    <>
      <a
        href={`/${shop.slug}`}
        style={openProductionLink}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Text style={styles.openProductionLink}>
          Ir a mi Sitio
          <Image
            source={"/images/external-link-alt.png"}
            style={styles.openProductionLinkIcon}
          />
        </Text>
      </a>

      <Shop shop={shop} products={products} isPreview={true} />
    </>
  )
}
const styles = StyleSheet.create({
  openProductionLink: {
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
