import { useRouter } from "next/router"
import { useCallback, useRef } from "react"
import {
  StyleSheet,
  ViewStyle,
  FlatList,
  Text,
  TouchableHighlight,
  View,
} from "react-native"

import { colors } from "@/common/colors"

import { useAppDispatch as useDispatch } from "@/common/hooks"
import ShopCard from "@/components/Home/ShopCard"
import { setFirstVisibleItem } from "@/store/homeSlice"

import { setShop } from "@/store/shopSlice"
import type { Shop } from "types"

type Props = {
  firstVisibleItem: number
  firstVisibleItemIndex: number
  shops: Shop[]
}

const ShopList = ({
  firstVisibleItem,
  firstVisibleItemIndex,
  shops,
}: Props) => {
  const ITEM_HEIGHT = 130
  const initialScrollIndex = firstVisibleItem ?? 0
  let touchStartingPoint = 0
  let touchCurrentPoint = 0

  const router = useRouter()
  const dispatch = useDispatch()

  const viewabilityConfig = {
    waitForInteraction: true,
    itemVisiblePercentThreshold: 50,
  }

  const onViewableItemsChanged = ({ viewableItems, changed }) => {
    if (viewableItems !== undefined && viewableItems.length > 0) {
      firstVisibleItemIndex = viewableItems[0].index
    }
  }

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ])

  const onSelect = useCallback(
    (shop) => {
      const distance = Math.abs(touchStartingPoint - touchCurrentPoint)
      if (distance <= 10) {
        dispatch(setFirstVisibleItem(firstVisibleItemIndex))
        dispatch(setShop(shop))
        router.push(`/${shop.slug}`)
      }
    },
    [
      router,
      dispatch,
      touchCurrentPoint,
      touchStartingPoint,
      firstVisibleItemIndex,
    ]
  )

  const renderHeader = (count: number) => {
    const shopText = count > 0 || count === 0 ? "comercios" : "comercio"
    const countText = count === 0 ? "No hay" : count

    return (
      <Text style={styles.count}>
        {countText} {shopText} locales
      </Text>
    )
  }

  const handleTouchStart = (evt: TouchEvent) => {
    if (evt.touches.length > 0) {
      touchStartingPoint = evt.touches[0].clientY
      touchCurrentPoint = touchStartingPoint
    }
  }

  const handleTouchMove = (evt: TouchEvent) => {
    if (evt.touches.length > 0) {
      touchCurrentPoint = evt.touches[0].clientY
    }
  }

  const renderShop = ({ item }: { item: Shop }) => (
    <TouchableHighlight
      delayPressIn={5000}
      underlayColor={colors.lightBackground}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onPress={() => onSelect(item)}
    >
      <ShopCard shop={item} />
    </TouchableHighlight>
  )

  const shopLayout = (_data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index + 110,
    index,
  })

  return (
    <FlatList
      viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      data={shops}
      renderItem={renderShop}
      keyExtractor={(shop) => shop.id}
      getItemLayout={shopLayout}
      initialScrollIndex={initialScrollIndex ?? 0}
      // TODO: Remover. Para que al hacer scroll se vea la última celda
      ListFooterComponent={<View style={styles.lastView} />}
      ListHeaderComponent={renderHeader(shops.length)}
      scrollEventThrottle={160}
      showsVerticalScrollIndicator={false}
      style={styles.list}
    />
  )
}

type Styles = {
  count: ViewStyle
  lastView: ViewStyle
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
  lastView: {
    backgroundColor: colors.none,
    height: 250,
  },
  list: {
    height: "100vh",
  },
})

export default ShopList
