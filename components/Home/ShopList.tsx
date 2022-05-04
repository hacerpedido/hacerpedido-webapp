import { useRouter } from "next/router"
import { useCallback } from "react"
import {
  StyleSheet,
  ViewStyle,
  FlatList,
  Text,
  TouchableHighlight,
} from "react-native"

import { colors } from "@/common/colors"

import { useAppDispatch as useDispatch } from "@/common/hooks"
import ShopCard from "@/components/Home/ShopCard"

import { setShop } from "@/store/shopSlice"
import type { Shop } from "types"

type Props = {
  shops: Shop[]
}

const ShopList = ({ shops }: Props) => {
  const touchStartingPoint = 0
  const touchCurrentPoint = 0

  const router = useRouter()
  const dispatch = useDispatch()

  const onSelect = useCallback(
    (shop) => {
      const distance = Math.abs(touchStartingPoint - touchCurrentPoint)
      if (distance <= 10) {
        dispatch(setShop(shop))
        router.push(`/${shop.slug}`)
      }
    },
    [router, dispatch, touchCurrentPoint, touchStartingPoint]
  )

  const renderListHeader = (count: number) => {
    const shopText = count > 0 || count === 0 ? "comercios" : "comercio"
    const countText = count === 0 ? "No hay" : count

    return (
      <Text style={styles.count}>
        {countText} {shopText} locales
      </Text>
    )
  }

  const renderShop = ({ item }: { item: Shop }) => (
    <TouchableHighlight
      delayPressIn={5000}
      underlayColor={colors.lightBackground}
      onPress={() => onSelect(item)}
    >
      <ShopCard shop={item} />
    </TouchableHighlight>
  )

  return (
    <FlatList
      style={styles.list}
      data={shops}
      renderItem={renderShop}
      keyExtractor={(shop) => shop.id}
      ListHeaderComponent={renderListHeader(shops.length)}
      showsVerticalScrollIndicator={false}
    />
  )
}

type Styles = {
  count: ViewStyle
  list: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  count: {
    color: colors.lightGrey,
    fontFamily: "Barlow",
    fontSize: 14,
    fontWeight: "400",
    marginVertical: 15,
  },
  list: {
    height: "100vh",
  },
})

export default ShopList
