import axios from "axios"
import Head from "next/head"
import { useRouter } from "next/router"
import { useLayoutEffect } from "react"
import { Text, View } from "react-native"

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from "@/common/hooks"
import Loading from "@/components/Loading"
import ShopFooter from "@/components/Shop/ShopFooter"
import ShopView from "@/components/Shop/ShopView"
import { loading } from "@/store/appSlice"
import { setShop } from "@/store/shopSlice"

export default function Shop() {
  const router = useRouter()
  const dispatch = useDispatch()
  const isLoading = useSelector((state) => state.app.loading)
  const shop = useSelector((state) => state.shop.shop)

  const { slug } = router.query

  useLayoutEffect(() => {
    const getData = async () => {
      dispatch(loading(true))

      try {
        const shopData = await axios.get(
          `${window.location.origin}/api/shop/${slug}`
        )

        dispatch(setShop(shopData.data))
      } catch (error) {
        console.log(JSON.stringify(error, null, 2))
      } finally {
        dispatch(loading(false))
      }
    }

    if (slug != null) {
      getData()
    }
  }, [dispatch, slug])

  if (!slug || shop?.slug !== slug) {
    return isLoading ? (
      <Loading />
    ) : (
      <Text>Sin comercios en la base de datos para {slug}.</Text>
    )
  }

  if (!shop) {
    return <Text>Sin comercios en la base de datos para {slug}</Text>
  }

  return (
    <View>
      <Head>
        <title>{shop.name} | Hacer Pedido</title>
        <meta property="og:image" content="/logo512.png" />
        <meta property="og:description" content={shop.name} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Hacer Pedido" />
        <meta property="og:title" content={shop.name} />
        <meta
          property="og:url"
          content={"https://hacerpedido.com/" + shop.slug}
        />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={shop.name} />
        <meta property="twitter:description" content={shop.name} />
        <meta
          property="twitter:url"
          content={"https://hacerpedido.com/" + shop.slug}
        />
      </Head>

      <ShopView shop={shop} />

      <ShopFooter shop={shop} />
    </View>
  )
}

//
//  Implementación inicial de SSR para esta página. El problema es que depende de setShop para el carrito
//
// export async function getServerSideProps(context) {
//   const slug = context.params.slug;
//
//   try {
//     const client = useApolloClient();
//     const shop = await client.query({
//       query: getShopWithDetails,
//       variables: { slug },
//     });
//
//     console.log({ shop, slug });
//
//     return {
//       props: { shop, slug },
//     };
//   } catch (error) {
//     console.log(JSON.stringify(error, null, 2));
//   }
//
//   console.log("slug:" + slug);
//
//   return {
//     props: { slug },
//   };
// }
