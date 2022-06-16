import { GetServerSideProps } from "next"
import Head from "next/head"
import { useEffect } from "react"
import { View } from "react-native"

import Shop from "components/Shop/Shop"
import prisma from "lib/prisma"
import { getShop, resetCart } from "store"
import type { Shop as ShopType, Product } from "types"

type Props = {
  shop: ShopType
  products: Product[]
}

export default function ShopView({ shop, products }: Props) {
  const { name, slug } = shop
  const url = `https://hacerpedido.com/${slug}`
  const cartShop = getShop()

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
      <Shop shop={shop} products={products} />
    </View>
  )
}

// TODO: this should be getStaticProps
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug
  const shop = await prisma.shop.findUnique({
    where: { slug },
  })

  if (!shop) {
    return {
      notFound: true,
    }
  }

  // TODO: query should include products
  const products = await prisma.product.findMany({
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
