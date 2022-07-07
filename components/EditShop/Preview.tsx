import type { Shop as ShopType, Product } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { StyleSheet, Text } from "react-native"

import Shop from "components/Shop/Shop"
import theme from "lib/theme"

type Props = {
  shop: ShopType
  products: Product[]
}
export default function Preview({ shop, products }: Props) {
  const openProductionLink = {
    paddingBottom: 30,
    textAlign: "center" as const,
    textDecoration: "none",
  }

  return (
    <>
      <Link href={`/${shop.slug}`}>
        <a style={openProductionLink} rel="noopener noreferrer" target="_blank">
          <Text style={styles.openProductionLink}>
            {"Ir a mi Sitio "}
            <Image
              src={"/images/external-link-alt.png"}
              alt="open production link"
              width={18}
              height={16}
            />
          </Text>
        </a>
      </Link>

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
})
