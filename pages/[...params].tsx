import axios from "axios"

import ErrorPage from "next/error"
import Head from "next/head"
import { useRouter } from "next/router"
import { useLayoutEffect, useState } from "react"
import { Text } from "react-native"

import EditView from "@/components/EditShop/EditView"
import Loading from "@/components/Loading"
import { trimObject } from "@/lib/utils/utils"
import { saveShopWithProducts } from "@/pages/api/shop/update"

export default function EditShopPage() {
  const [shop, setShop] = useState()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [isSaving, setSaving] = useState(false)

  const router = useRouter()
  const { params } = router.query
  const token = typeof params !== "undefined" ? params[0] : undefined

  // TODO: this should update preview values as we edit the table
  // setShop(trimObject({ ...shop, watch() }))

  // TODO: useLayoutEffect does nothing on the server, because its effect cannot be encoded into the server renderer's output format. This will lead to a mismatch between the initial, non-hydrated UI and the intended UI. To avoid this, useLayoutEffect should only be used in components that render exclusively on the client. See https://reactjs.org/link/uselayouteffect-ssr for common fixes.
  // TODO: move to getserversideprops
  useLayoutEffect(() => {
    if (!token) return
    ;(async () => {
      setIsLoading(true)
      try {
        const { data } = await axios.get(
          `${window.location.origin}/api/shop/by-token`,
          { params: { token } }
        )

        setShop(data)
        setProducts(data.products)
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          const message = error.response.data.message
          alert(`Error al leer los datos. (${error} Error: ${message})`)
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [token])

  const onSubmit = (data: ShopType) => {
    trimObject(data)

    async function saveData() {
      setSaving(true)
      const dataToSave = {
        ...data,
        id: shop.id,
        slug: shop.slug,
        region: shop.region,
      }

      const result = await saveShopWithProducts(token, dataToSave, products)
      setMessage(result.message)

      if (result.error == null) {
        const updatedShop = { ...shop, ...dataToSave }
        if (products != null) {
          updatedShop.products = products
        }
        setIsLoading(true)
      }

      setShowMessage(true)
      setSaving(false)
      // setShop(null)
      setIsLoading(true)
    }
    saveData()
  }
  if (params && params[1] !== "edit") {
    return <ErrorPage statusCode={404} />
  }

  if (!shop && !isLoading) {
    return (
      <Text>{`No hay un comercio en la base de datos para el token ${token}`}</Text>
    )
  }

  return (
    <>
      <Head>
        <title>{shop?.name} | Hacer Pedido</title>
      </Head>

      {isLoading ? <Loading /> : <EditView shop={shop} products={products} />}
    </>
  )
}
