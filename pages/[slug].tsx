import { PrismaClient } from "@prisma/client"
import { GetServerSideProps } from "next"
import dynamic from "next/dynamic"
import Error from "next/error"
import Head from "next/head"
import { useEffect } from "react"
import { View, ViewStyle, StyleSheet } from "react-native"

import Divider from "@/components/Divider"
import ProductList from "@/components/Shop/ProductList"
import ShopHeader from "@/components/Shop/ShopHeader"
import ShopNotes from "@/components/Shop/ShopNotes"
import { colors } from "@/lib/colors"
import { groupAndSortByCategory } from "@/lib/utils/products"
import { getShop, resetCart } from "store"
import type { Shop, Product } from "types"

// NOTE: fixes localstorage ssr issues https://github.com/vercel/next.js/discussions/35773
const ShopFooter = dynamic(() => import("@/components/Shop/ShopFooter"), {
  ssr: false,
})

type Props = {
  shop: Shop
  products: Product[]
}

export default function Shop({ shop, products }: Props) {
  if (!shop) return <Error statusCode={404} />

  const { name, slug, orderswhatsappnumber } = shop
  const url = `https://hacerpedido.com/${slug}`
  const cartShop = getShop()
  const groupedCategories = groupAndSortByCategory(products)

  useEffect(() => {
    if (slug != cartShop?.slug) {
      resetCart(shop)
    }
  }, [shop, slug, cartShop])

  return (
    <View>
      <Head>
        <title>{`${name} | Hacer Pedido`}</title>
        <meta property="og:image" content="/logo512.png" />
        <meta property="og:description" content={name} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Hacer Pedido" />
        <meta property="og:title" content={name} />
        <meta property="og:url" content={url} />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={name} />
        <meta property="twitter:description" content={name} />
        <meta property="twitter:url" content={url} />
      </Head>

      <ShopHeader isPreview={false} shop={shop} />

      <View style={styles.container}>
        <ShopNotes shop={shop} />
        {groupedCategories.map(({ name, products }, index) => (
          <div key={`productList-${index}`}>
            <ProductList
              category={name}
              products={products}
              isCartEnabled={!!orderswhatsappnumber}
            />

            <Divider />
          </div>
        ))}
        <ShopFooter shop={shop} />
      </View>
    </View>
  )
}

type Styles = {
  container: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: colors.white,
    marginBottom: 130,
  },
})

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const prisma = new PrismaClient()
  const slug = params?.slug || ""
  let products: Product[] = []

  const shop = await prisma.shop.findUnique({
    where: { slug },
  })

  if (shop) {
    products = await prisma.product.findMany({
      where: { shopid: shop.id },
      orderBy: { itemnumber: "asc" },
    })
  }

  return {
    props: {
      shop: JSON.parse(JSON.stringify(shop)),
      products: JSON.parse(JSON.stringify(products)),
    },
  }
}
