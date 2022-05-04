import axios from "axios"
import Head from "next/head"
import { useEffect, useState } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

import { colors } from "@/common/colors"
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from "@/common/hooks"
import HomeFilterBar from "@/components/Home/HomeFilterBar"
import HomeHeader from "@/components/Home/HomeHeader"
import ShopList from "@/components/Home/ShopList"
import Loading from "@/components/Loading"
import { loading } from "@/store/appSlice"
import { setCategory, setShops } from "@/store/homeSlice"
import type { Shop } from "types"

export default function Home() {
  const [firstVisibleItemIndex, setFirstVisibleItemIndex] = useState(0)
  const firstVisibleItem = useSelector((state) => state.home.firstVisibleItem)
  const category = useSelector((state) => state.home.selectedFilter)
  const shops = useSelector((state) => state.home.shops)
  const isLoading = useSelector((state) => state.app.loading)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(loading(true))
    ;(async () => {
      try {
        const { data } = await axios.get(
          `${window.location.origin}/api/shop/home`,
          { params: { category } }
        )
        dispatch(setShops(data))
        dispatch(loading(false))
      } catch (error) {
        console.log(JSON.stringify(error, null, 2))
      }
      dispatch(loading(false))
    })()
  }, [dispatch, category])

  const filteredShops = shops.filter(
    (shop: Shop) => shop.visibility === "public" && shop.category === category
  )

  const handleSelectFilter = (selected: string) => {
    setFirstVisibleItemIndex(0)
    dispatch(setCategory(selected))
  }

  return (
    <View>
      <Head>
        <title>Hacer Pedido | Pedí a tu comercio favorito por WhatsApp.</title>
      </Head>

      <View style={styles.header}>
        <HomeHeader />
        <HomeFilterBar
          selectedFilter={category}
          onSelectFilter={handleSelectFilter}
        />
      </View>

      <View style={styles.body}>
        {isLoading ? (
          <Loading />
        ) : (
          <ShopList
            firstVisibleItem={firstVisibleItem}
            firstVisibleItemIndex={firstVisibleItemIndex}
            shops={filteredShops}
          />
        )}
      </View>
    </View>
  )
}

type Styles = {
  body: ViewStyle
  header: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  body: {
    backgroundColor: colors.homeBackground,
    flex: 1,
    marginTop: 110,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  header: {
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 2,
  },
})
