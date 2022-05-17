import axios from "axios"
import ErrorPage from "next/error"
import Head from "next/head"
import { useRouter } from "next/router"
import { useLayoutEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { StyleSheet, Text, View, ViewStyle } from "react-native"

import theme from "@/lib/theme"
import { trimObject } from "@/lib/utils/utils"
import { saveShopWithProducts } from "@/pages/api/shop/update"
import EditProducts from "components/EditShop/EditProducts"
import EditShopForm from "components/EditShop/EditShopForm"
// import Preview from "components/EditShop/Preview"
import Form from "components/Form"
import Loading from "components/Loading"
import MessageBox from "components/MessageBox"

import type { Shop } from "types"

export default function EditShopPage() {
  const [shop, setShop] = useState()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState("")
  const [isSaving, setSaving] = useState(false)

  const router = useRouter()
  const { params } = router.query
  const token = typeof params !== "undefined" ? params[0] : undefined
  // const width = typeof window !== "undefined" ? window.innerWidth : 1000
  // const showPreview = width > 1000

  const {
    handleSubmit,
    register,
    setValue,
    control,
    // watch,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  })

  // TODO: this should update preview values as we edit the table
  // setShop(trimObject({ ...shop, watch() }))

  // TODO: useLayoutEffect does nothing on the server, because its effect cannot be encoded into the server renderer's output format. This will lead to a mismatch between the initial, non-hydrated UI and the intended UI. To avoid this, useLayoutEffect should only be used in components that render exclusively on the client. See https://reactjs.org/link/uselayouteffect-ssr for common fixes.
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

  const isError = Object.keys(errors).length > 0

  const onSubmit = (data: Shop) => {
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
        setIsLoading({ shop: updatedShop, loading: false })
      }

      setShowMessage(true)
      setSaving(false)
      // setShop(null)
      setIsLoading(true)
    }
    saveData()
  }

  function onMessagePress() {
    setShowMessage(!showMessage)
  }

  const EditView = () => {
    return (
      <>
        <View style={styles.container}>
          <View style={styles.leftContainer}>
            <Form {...{ register, setValue, errors, control }}>
              <EditShopForm
                shop={shop}
                control={control}
                errors={errors}
                handleSubmit={handleSubmit(onSubmit)}
                getValues={getValues}
                isSaving={isSaving}
              />
              <EditProducts
                shop={shop}
                products={products}
                setProducts={setProducts}
              />
            </Form>
          </View>

          {/* {showPreview && ( */}
          {/*   <Preview shop={shop} products={products} isLoading={isLoading} /> */}
          {/* )} */}

          {showMessage && (
            <MessageBox
              message={
                isError
                  ? "Hubo errores en los datos que ingresaste. Por favor revisalos y grabá nuevamente."
                  : message
              }
              isError={isError}
              onMessagePress={onMessagePress}
            />
          )}
        </View>
      </>
    )
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

      {isLoading ? <Loading /> : <EditView />}
    </>
  )
}

type Styles = {
  container: ViewStyle
  leftContainer: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: theme.colors.lightGrey2,
    flexDirection: "row",
    height: "100vh",
  },
  leftContainer: {
    backgroundColor: theme.colors.lightBackground,
    flex: 1,
    overflowY: "scroll",
    padding: 40,
  },
})
