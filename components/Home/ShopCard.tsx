import { View, Image, StyleSheet, Text } from "react-native"

import colors from "../../assets/colors"
import { getLogoForShop } from "../../lib/utils/shops"
import { Shop } from "../../types"
import DecoratedLabel from "../DecoratedLabel"

type Props = {
  shop: Shop
}

const ShopCard = ({ shop }: Props) => {
  const { name, address, opentimes, deliverycost } = shop

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <View style={styles.containerLogo}>
          <Image source={{ uri: getLogoForShop(shop) }} style={styles.logo} />
        </View>
        <View style={styles.containerLabels}>
          <Text style={styles.shopName}>{name.toLowerCase()}</Text>
          {address && (
            <DecoratedLabel
              iconName="pin"
              text={address}
              iconColor={iconColor}
              textColor={colors.lightGrey}
            />
          )}
          {opentimes && (
            <DecoratedLabel
              iconName="clock"
              text={opentimes}
              iconColor={iconColor}
              textColor={colors.lightGrey}
            />
          )}

          {/* TODO: El siguiente Text tag está agregado para evitar errores en la consola: A text node cannot be a child of a <View> */}
          <Text>
            {deliverycost && (
              <DecoratedLabel
                iconName="car"
                text={deliverycost}
                iconColor={iconColor}
                textColor={colors.lightGrey}
              />
            )}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default ShopCard

const iconColor = "#C5CEE0"

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: 7,
    borderWidth: 1,
    marginBottom: 6,
    padding: 15,
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
    height: 75,
    width: 75,
  },
  logo: {
    backgroundColor: colors.lightBackground,
    borderRadius: 37.5,
    height: 75,
    width: 75,
  },
  shopName: {
    color: colors.brown,
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "capitalize",
  },
})
