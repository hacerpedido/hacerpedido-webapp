import axios, { AxiosError } from "axios"
import ErrorPage from "next/error"
import Head from "next/head"
import { useRouter } from "next/router"
import { useLayoutEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { StyleSheet, Text, View, ViewStyle } from "react-native"

import { saveShopWithProducts } from "@/common/api/shops"
import theme from "@/common/theme"
import { trimObject } from "@/common/utils/utils"
import EditProducts from "components/EditShop/EditProducts"
import EditShopForm from "components/EditShop/EditShopForm"
import Preview from "components/EditShop/Preview"
import Form from "components/Form"
import Loading from "components/Loading"
import MessageBox from "components/MessageBox"

import type { Shop } from "types"

export default function EditShopPage() {
  const [shop, setShop] = useState({ products: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState("")
  const [isSaving, setSaving] = useState(false)

  const [tempProducts, setTempProducts] = useState([])
  const router = useRouter()
  const { params } = router.query
  const token = typeof params !== "undefined" ? params[0] : undefined
  const width = typeof window !== "undefined" ? window.innerWidth : 1000
  const showPreview = width > 1000

  const previewProducts = () => tempProducts ?? shop.products

  useLayoutEffect(() => {
    if (!token) return

    setIsLoading(true)
    ;(async () => {
      try {
        const { data } = await axios.get(
          `${window.location.origin}/api/shop/by-token`,
          { params: { token } }
        )
        setShop(data)
      } catch (error: any | AxiosError) {
        if (!axios.isAxiosError(error)) {
          const message = error.response.data.message
          alert(`Error al leer los datos. (${error} Error: ${message})`)
        }
      }
      setIsLoading(false)
    })()
  }, [token])

  const {
    handleSubmit,
    register,
    setValue,
    control,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  })

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

      const result = await saveShopWithProducts(token, dataToSave, tempProducts)
      setMessage(result.message)

      if (result.error == null) {
        const editedShop = { ...shop, ...dataToSave }
        if (tempProducts != null) {
          editedShop.products = tempProducts
        }
        setIsLoading({ shop: editedShop, loading: false })
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

  const tempValues = watch()
  const tempShop = trimObject({ ...shop, ...tempValues })

  const EditView = () => (
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
              products={shop.products}
              shopId={shop.id}
              setTempProducts={setTempProducts}
            />
          </Form>
        </View>

        {showPreview && (
          <Preview
            products={previewProducts}
            shop={shop}
            isLoading={isLoading}
            tempShop={tempShop}
          />
        )}
      </View>

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
    </>
  )

  return (
    <>
      <Head>
        <title>{tempShop.name} | Hacer Pedido</title>
      </Head>

      {!params || (isLoading && <Loading />)}
      {/* // Sólo para las páginas de edit por ahora */}
      {params && params[1] !== "edit" && <ErrorPage statusCode={404} />}
      {token == null && <Text>Error cargando el comercio.</Text>}
      {shop == null && (
        <Text>
          `No hay un comercio en la base de datos para el token ${token}`
        </Text>
      )}
      <EditView />
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
