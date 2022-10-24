import type { GetServerSideProps } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"

import EditView from "components/EditShop/EditView"
import prisma from "lib/prisma"
import type { Shop as ShopType, Product } from "types"

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

export default dynamic(() => Promise.resolve(EditShopPage), {
  ssr: false,
})

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const typeformtoken = String(params?.slug)

  const shopWithProducts = await prisma.shop.findUnique({
    where: { typeformtoken },
    include: {
      products: {
        orderBy: {
          itemnumber: "asc",
        },
      },
    },
  })

  return {
    props: {
      shop: JSON.parse(JSON.stringify(shopWithProducts)),
      products: JSON.parse(JSON.stringify(shopWithProducts?.products)),
    },
  }
}
