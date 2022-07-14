import Image from "next/image"
import Link from "next/link"
import { View, StyleSheet, Text, ViewStyle, TextStyle } from "react-native"

import DecoratedLabel from "../DecoratedLabel"

import { colors } from "@/lib/colors"
import { getLogoForShop } from "@/lib/utils/shops"

import type { Shop } from "types"

type Props = {
  shop: Shop
}

const ShopCard = ({ shop }: Props) => {
  const { name, slug, address, opentimes, deliverycost } = shop

  return (
    <Link href={`/${slug}`}>
      <View style={styles.card}>
        <View style={styles.container}>
          <View style={styles.containerLogo}>
            <Image
              src={`${getLogoForShop(shop)}?auto=format,compress&cs=tinysrgb`}
              blurDataURL={`${getLogoForShop(shop)}?q=10&blur=100`}
              placeholder="blur"
              alt={shop.name}
              height={75}
              width={75}
            />
          </View>

          <View style={styles.containerLabels}>
            <Text style={styles.shopName}>{name.toLowerCase()}</Text>

            {!!address && (
              <DecoratedLabel
                iconName="pin"
                text={address}
                iconColor={iconColor}
                textColor={colors.lightGrey}
              />
            )}

            {!!opentimes && (
              <DecoratedLabel
                iconName="clock"
                text={opentimes}
                iconColor={iconColor}
                textColor={colors.lightGrey}
              />
            )}

            {!!deliverycost && (
              <DecoratedLabel
                iconName="car"
                text={deliverycost}
                iconColor={iconColor}
                textColor={colors.lightGrey}
              />
            )}
          </View>
        </View>
      </View>
    </Link>
  )
}

export default ShopCard

const iconColor = "#C5CEE0"

type Styles = {
  card: ViewStyle
  container: ViewStyle
  containerLabels: ViewStyle
  containerLogo: ViewStyle
  shopName: TextStyle
}

const styles = StyleSheet.create<Styles>({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: 7,
    borderWidth: 1,
    marginBottom: 6,
    padding: 15,
    cursor: "pointer",
  },
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  containerLabels: {
    flex: 1,
    marginLeft: 8,
    paddingLeft: 8,
  },
  containerLogo: {
    alignItems: "center",
    flex: -1,
    backgroundColor: colors.lightBackground,
    overflow: "hidden",
    borderRadius: 37.5,
  },
  shopName: {
    color: colors.brown,
    fontFamily: "Barlow",
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "capitalize",
  },
})
