import { PrismaClient } from "@prisma/client"
import { GetServerSideProps } from "next"
import ErrorPage from "next/error"
import Head from "next/head"
import { useEffect } from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
import { useCart } from "react-use-cart"

import ProductList from "@/components/Shop/ProductList"
import ShopFooter from "@/components/Shop/ShopFooter"
import ShopHeader from "@/components/Shop/ShopHeader"
import ShopNotes from "@/components/Shop/ShopNotes"
import { colors } from "@/lib/colors"
import type { Shop, Product } from "types"

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const prisma = new PrismaClient()
  const slug = params?.slug || ""
  let products = []

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

type Props = {
  shop: Shop
  products: Product[]
}

export default function Shop({ shop, products }: Props) {
  if (!shop) return <ErrorPage statusCode={404} />

  const { setCartMetadata, metadata, emptyCart } = useCart()
  const { name, slug, orderswhatsappnumber } = shop
  const url = `https://hacerpedido.com/${slug}`

  useEffect(() => {
    if (slug != metadata?.slug) {
      setCartMetadata({ slug, orderswhatsappnumber })
      emptyCart()
    }
  }, [metadata, setCartMetadata, emptyCart, slug, orderswhatsappnumber])

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

        <ProductList
          products={products}
          isCartEnabled={!!orderswhatsappnumber}
        />

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
