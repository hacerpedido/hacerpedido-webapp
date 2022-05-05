import axios from "axios"
import { GetStaticProps, GetStaticPropsContext } from "next"
import Head from "next/head"
import { useEffect, useState } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

import { colors } from "@/common/colors"
import { useAppDispatch as useDispatch } from "@/common/hooks"
import { categories } from "@/common/utils/categories"
import HomeFilterBar from "@/components/Home/HomeFilterBar"
import HomeHeader from "@/components/Home/HomeHeader"
import ShopList from "@/components/Home/ShopList"
import Loading from "@/components/Loading"
import type { Shop } from "types"

export default function Home() {
  const [shops, setShops] = useState([])
  const [category, setCategory] = useState(categories[0])
  const [isLoading, setIsLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    setIsLoading(true)
    ;(async () => {
      try {
        const { data } = await axios.get(
          `${window.location.origin}/api/shop/home`,
          { params: { category } }
        )
        dispatch(setShops(data))
      } catch (error) {
        console.log(JSON.stringify(error, null, 2))
      }
      setIsLoading(false)
    })()
  }, [dispatch, category])

  const filteredShops = shops.filter(
    (shop: Shop) => shop.visibility === "public" && shop.category === category
  )

  const handleSelectFilter = (selected: string) => {
    setCategory(selected)
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
        {isLoading ? <Loading /> : <ShopList shops={filteredShops} />}
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

// export const getStaticProps: GetStaticProps = async () => {
//   const shops = await prisma.post.findMany({
//     where: { visibility: "public", category: "Comida" },
//     orderBy: "name",
//   })
//   return { props: { shops } }
// }
