import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"

import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ViewStyle,
  TextStyle,
} from "react-native"

import { PhoneCallIcon, ArrowLeftIcon } from "@/components/icons"
import { colors } from "@/lib/colors"
import { getBackgroundColorForCategory } from "@/lib/utils/categories"
import { getLogoForShop, getBackgroundForShop } from "@/lib/utils/shops"
import { generateCallUrl } from "@/lib/utils/utils"

import DecoratedLabel from "components/DecoratedLabel"

import type { Shop as ShopType } from "types"

type Props = {
  isPreview?: boolean
  shop: ShopType
}

const ShopHeader = ({ isPreview = false, shop }: Props) => {
  const {
    name,
    background,
    category,
    address,
    region,
    typeformtoken,
    ordersphonenumber,
    orderswhatsappnumber,
  } = shop

  const router = useRouter()
  const displayEditLink =
    (process.env.NODE_ENV == "development" ||
      process.env.VERCEL_ENV !== "production") &&
    !isPreview

  const containerStyles = {
    backgroundImage: getBackgroundForShop(shop),
    backgroundSize: background ? "100% auto" : "auto",
    backgroundColor: getBackgroundColorForCategory(category),
  }

  const onButtonBackPress = () => {
    !isPreview && router.push("/")
  }
  const showButtonCall = ordersphonenumber && orderswhatsappnumber && !isPreview

  const ButtonCall = () => (
    <TouchableHighlight underlayColor={"none"}>
      <a
        href={generateCallUrl(ordersphonenumber)}
        style={{ textDecoration: "none" }}
      >
        <View style={styles.buttonCall}>
          <PhoneCallIcon />
          <Text style={styles.buttonText}>Llamar</Text>
        </View>
      </a>
    </TouchableHighlight>
  )

  const displayAddress = address?.trim() ?? region
  const addressUrl = `https://www.google.com/maps/?q=${displayAddress}`
  const opentimes = shop?.opentimes?.trim() !== "" ? shop.opentimes : null
  const deliverycost =
    shop?.deliverycost?.trim() !== "" ? shop.deliverycost : null

  return (
    <View style={containerStyles}>
      <View style={styles.containerNavigator}>
        {!isPreview && (
          <TouchableHighlight
            underlayColor={"none"}
            onPress={onButtonBackPress}
            style={styles.buttonBack}
          >
            <ArrowLeftIcon color={colors.white} />
          </TouchableHighlight>
        )}

        {showButtonCall && (
          <View style={styles.buttonCallContainer}>
            <ButtonCall />
          </View>
        )}
      </View>

      <View style={styles.containerData}>
        <View style={styles.containerLogo}>
          <Image
            src={`${getLogoForShop(shop)}`}
            blurDataURL={`${getLogoForShop(shop, true)}`}
            placeholder="blur"
            alt={name}
            height={100}
            width={100}
          />
        </View>

        {displayEditLink && (
          <Link href={`/${typeformtoken}/edit`}>
            <a>edit</a>
          </Link>
        )}

        <Text style={styles.shopName}>{name?.toLowerCase()}</Text>
        {displayAddress && (
          <a
            href={addressUrl}
            style={{ textDecoration: "none" }}
            target="_blank"
            rel="noreferrer"
          >
            <DecoratedLabel
              iconName="pin"
              text={displayAddress}
              iconColor={colors.white}
              textColor={colors.white}
              fontSize={13}
              marginBottom={4}
            />
          </a>
        )}
        {opentimes && (
          <DecoratedLabel
            iconName="clock"
            text={opentimes}
            iconColor={colors.white}
            textColor={colors.white}
            fontSize={13}
            marginBottom={4}
          />
        )}
        {deliverycost && (
          <DecoratedLabel
            iconName="car"
            text={"Delivery: " + deliverycost}
            iconColor={colors.white}
            textColor={colors.white}
            fontSize={13}
            marginBottom={4}
          />
        )}
      </View>
    </View>
  )
}

export default ShopHeader

// TODO: the header is dispplaying some extra padding at the bottom
type Styles = {
  buttonBack: ViewStyle
  buttonCall: ViewStyle
  buttonCallContainer: ViewStyle
  buttonText: TextStyle
  containerNavigator: ViewStyle
  containerData: ViewStyle
  containerLogo: ViewStyle
  shopName: TextStyle
}

// TODO: poner el ButtonCall y el ButtonBack en la misma fila usando flex y posicionando con absolute
const styles = StyleSheet.create<Styles>({
  buttonBack: {
    color: colors.white,
    padding: 24,
    position: "absolute",
    zIndex: 2,
  },
  buttonCall: {
    borderColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    color: colors.white,
    flexDirection: "row",
    justifyContent: "center",
    opacity: 0.7,
    paddingHorizontal: 9,
    paddingTop: 8,
    zIndex: 2,
  },
  buttonCallContainer: {
    position: "absolute",
    right: 24,
    top: 16,
    zIndex: 1,
  },
  buttonText: {
    color: colors.white,
    fontFamily: "Barlow",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 9,
  },
  containerData: {
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: 26,
    marginTop: -24,
    zIndex: 0,
  },
  containerLogo: {
    alignItems: "center",
    height: 100,
    width: 100,
    backgroundColor: colors.white,
    borderRadius: 50,
    overflow: "hidden",
  },
  containerNavigator: {
    backgroundColor: colors.none,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: "4em",
    zIndex: 2,
  },
  shopName: {
    color: colors.white,
    fontFamily: "Barlow",
    fontSize: 19,
    fontWeight: "700",
    marginVertical: 5,
    padding: 6,
    textTransform: "capitalize",
  },
})
