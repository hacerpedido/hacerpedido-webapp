import Head from "next/head"
import { useState } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

import useSWR from "swr"

import HomeFilterBar from "@/components/Home/HomeFilterBar"
import HomeHeader from "@/components/Home/HomeHeader"
import ShopList from "@/components/Home/ShopList"
import Loading from "@/components/Loading"
import { colors } from "@/lib/colors"
import fetcher from "@/lib/fetcher"
import { categories } from "@/lib/utils/categories"

export default function Home() {
  // TODO: uncomment once we have pagination
  // const [category, setCategory] = useState(undefined)
  const [category, setCategory] = useState(categories[0])

  const { data } = useSWR(`/api/shop?category=${category}`, fetcher)

  const handleSelectFilter = (selected: string) => {
    // TODO: uncomment once we have pagination
    // if (selected === category) {
    //   return setCategory(undefined)
    // }
    setCategory(selected)
  }

  return (
    <View>
      <Head>
        <title>Hacer Pedido | Pedí a tu comercio favorito por WhatsApp.</title>
      </Head>

      <View style={s.header}>
        <HomeHeader />
        <HomeFilterBar selected={category} onSelect={handleSelectFilter} />
      </View>

      <View style={s.body}>
        {!data ? <Loading /> : <ShopList shops={data} />}
      </View>
    </View>
  )
}

type Styles = {
  body: ViewStyle
  header: ViewStyle
}

const s = StyleSheet.create<Styles>({
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
