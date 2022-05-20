import axios from "axios"

import Head from "next/head"
import { useEffect, useState } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

import HomeFilterBar from "@/components/Home/HomeFilterBar"
import HomeHeader from "@/components/Home/HomeHeader"
import ShopList from "@/components/Home/ShopList"
import Loading from "@/components/Loading"
import { colors } from "@/lib/colors"
import { categories } from "@/lib/utils/categories"

export default function Home() {
  const [shops, setShops] = useState([])
  // TODO: uncomment once we have pagination
  // const [category, setCategory] = useState(undefined)
  const [category, setCategory] = useState(categories[0])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    ;(async () => {
      try {
        const { data } = await axios.get(`${window.location.origin}/api/shop`, {
          params: { category },
        })
        setShops(data)
      } catch (error) {
        console.log(JSON.stringify(error, null, 2))
      }
      setIsLoading(false)
    })()
  }, [category])

  const handleSelectFilter = (selected: string) => {
    // TODO: uncomment onece we have pagination
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

      <View style={styles.header}>
        <HomeHeader />
        <HomeFilterBar selected={category} onSelect={handleSelectFilter} />
      </View>

      <View style={styles.body}>
        {isLoading ? <Loading /> : <ShopList shops={shops} />}
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
