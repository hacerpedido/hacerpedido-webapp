import { GetServerSideProps } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"

import EditView from "components/EditShop/EditView"
import prisma from "lib/prisma"
import type { Shop as ShopType, Product } from "types"

// Para probar:
// http://localhost:3000/cfb6d51e87pfxuosysumcfb6d51vpka4/edit
// http://localhost:3000/test6grt3kg7w8x0w250yunjc6gru6f6/edit
// https://hacerpedido.com/test6grt3kg7w8x0w250yunjc6gru6f6/edit
type Props = {
  shop: ShopType
  products: Product[]
}
function EditShopPage({ shop, products }: Props) {
  return (
    <>
      <Head>
        <title>{shop.name} | Hacer Pedido</title>
      </Head>

      <EditView initialShop={shop} initialProducts={products} />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const token = params.params[0]

  // TODO: use find whn token becomes unique
  const shop = await prisma.shop.findFirst({
    where: { typeformtoken: token },
  })

  if (!shop || params.params[1] !== "edit") {
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

export default dynamic(() => Promise.resolve(EditShopPage), {
  ssr: false,
})
