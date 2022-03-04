import axios from "axios"
import ErrorPage from "next/error"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Image, StyleSheet, Text, View } from "react-native"

import { saveShopWithProducts } from "@/common/api/shops"

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from "@/common/hooks"

import theme from "@/common/theme"
import { trimObject } from "@/common/utils/utils"
import EditProductsForm from "components/EditShop/EditProducts"
import EditShopForm from "components/EditShop/EditShop"
import Form from "components/Form"
import Loading from "components/Loading"
import MessageBox from "components/MessageBox"
import ShopView from "components/Shop/ShopView"

// Para probar:
// http://localhost:3000/cfb6d51e87pfxuosysumcfb6d51vpka4/edit
// http://localhost:3000/test6grt3kg7w8x0w250yunjc6gru6f6/edit
// https://hacerpedido.com/test6grt3kg7w8x0w250yunjc6gru6f6/edit

export default function EditShopPage() {
  const router = useRouter()
  const dispatch = useDispatch()

  const [shopState, setShopState] = useState({ shop: null, loading: true })
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState("")
  const [isSaving, setSaving] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  const tempProducts = useSelector((state) => state.shopEdit.tempProducts)

  const { params } = router.query

  const token = typeof params !== "undefined" ? params[0] : undefined

  // let a = { params, token, shop: shopState.shop, resizedWidth, loading: shopState.loading };
  // console.log("PASS: ", a);

  useEffect(() => {
    if (!token) {
      return
    }

    if (!shopState?.loading) {
      setShopState({ shop: null, loading: true })
    }

    async function getData() {
      try {
        const shopData = await axios.get(
          `${window.location.origin}/api/shop/by-token`,
          { params: { token } }
        )

        setShopState({ shop: shopData.data, loading: false })
      } catch (error) {
        alert(
          `Error al leer los datos. (${error} Error: ${error.response.data.message})`
        )
        setShopState({ shop: null, loading: false })
      }
    }
    getData()
  }, [token, dispatch, reloadCount, shopState.loading, shopState.shop])

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

  if (!params || shopState.loading) {
    return <Loading />
  }

  // Sólo para las páginas de edit por ahora
  if (params[1] !== "edit") {
    return <ErrorPage statusCode={404} />
  }

  const onSubmit = (data) => {
    trimObject(data)

    async function saveData() {
      setSaving(true)
      const dataToSave = {
        ...data,
        id: shopState.shop.id,
        slug: shopState.shop.slug,
        region: shopState.shop.region,
      }

      const result = await saveShopWithProducts(token, dataToSave, tempProducts)
      setMessage(result.message)

      if (result.error == null) {
        const editedShop = { ...shopState.shop, ...dataToSave }
        if (tempProducts != null) {
          editedShop.products = tempProducts
        }
        setShopState({ shop: editedShop, loading: false })
      }

      setShowMessage(true)
      setSaving(false)
      refresh()
    }
    saveData()
  }

  function refresh() {
    setShopState({ shop: null, loading: true })
    setReloadCount(reloadCount + 1)
  }

  function onMessagePress() {
    setShowMessage(!showMessage)
  }

  if (token == null) {
    return <Text>Error cargando el comercio.</Text>
  }

  if (shopState.shop == null) {
    return (
      <Text>No hay un comercio en la base de datos para el token {token}</Text>
    )
  }

  const tempValues = watch()
  const tempShop = trimObject({ ...shopState.shop, ...tempValues })

  const products = shopState.shop?.products ?? []
  const previewProducts = tempProducts ?? products

  const width = typeof window !== "undefined" ? window.innerWidth : 1000
  const showPreview = width > 1000

  const isError = Object.keys(errors).length > 0

  const openProductionLink = {
    paddingBottom: 30,
    textAlign: "center",
    textDecoration: "none",
  }

  return (
    <>
      <Head>
        <title>{tempShop.name} | Hacer Pedido</title>
      </Head>

      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <Form {...{ register, setValue, errors, control }}>
            <EditShopForm
              shop={shopState.shop}
              control={control}
              errors={errors}
              handleSubmit={handleSubmit(onSubmit)}
              getValues={getValues}
              isSaving={isSaving}
              refresh={refresh}
            />
            <EditProductsForm products={products} shopId={shopState.shop.id} />
          </Form>
        </View>
        {showPreview && (
          <View style={styles.rightContainer}>
            <a
              href={`/${shopState.shop.slug}`}
              style={openProductionLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Text style={styles.openProductionLink}>
                Ir a mi Sitio
                <Image
                  source={"/images/external-link-alt.png"}
                  style={styles.openProductionLinkIcon}
                  alt="Ir a mi sitio"
                />
              </Text>
            </a>
            <ShopView
              previewProducts={previewProducts}
              shop={tempShop}
              isPreview={true}
            />
          </View>
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
}

const styles = StyleSheet.create({
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
  openProductionLink: {
    color: theme.colors.button1,
    fontFamily: "Barlow",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "600",
  },
  openProductionLinkIcon: {
    height: 16,
    margin: 3,
    top: 4,
    width: 18,
  },
  rightContainer: {
    backgroundColor: theme.colors.lightGrey2,
    padding: 30,
    width: 400,
  },
})
