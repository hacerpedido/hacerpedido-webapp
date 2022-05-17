import { PrismaClient } from "@prisma/client"
import { GetServerSideProps } from "next"
import ErrorPage from "next/error"
import Head from "next/head"
import { View, ViewStyle, StyleSheet } from "react-native"

import ProductList from "@/components/Shop/ProductList"
import ShopFooter from "@/components/Shop/ShopFooter"
import ShopHeader from "@/components/Shop/ShopHeader"
import ShopNotes from "@/components/Shop/ShopNotes"
import { colors } from "@/lib/colors"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const prisma = new PrismaClient()
  const slug = String(context.params.slug)

  const shop = await prisma.shops.findUnique({
    where: { slug },
  })

  const products = await prisma.products.findMany({
    where: { shopid: shop.id },
    orderBy: { itemnumber: "asc" },
  })

  return {
    props: {
      shop: JSON.parse(JSON.stringify(shop)),
      products: JSON.parse(JSON.stringify(products)),
    },
  }
}

export default function Shop({ shop, products }) {
  const { name, slug, orderswhatsappnumber } = shop

  if (!shop) {
    return <ErrorPage statusCode={404} />
  }

  const url = `https://hacerpedido.com/${slug}`

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
        <ProductList
          products={products}
          isCartEnabled={!!orderswhatsappnumber}
        />

        <ShopNotes shop={shop} />
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
