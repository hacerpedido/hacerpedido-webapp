import { useState, useMemo } from "react"
import { FormProvider, useForm } from "react-hook-form"
import type { SubmitHandler } from "react-hook-form"
import "react-image-crop/dist/ReactCrop.css"
import { StyleSheet, View } from "react-native"

import EditProductsTable from "./EditProductsTable"
import EditShopForm from "./EditShopForm"
import Header from "./Header"
import Preview from "./Preview"

import MessageBox from "components/MessageBox"
import theme from "lib/theme"
import { trimObject } from "lib/utils/utils"
import type { Shop, Product } from "types"

type FormInputs = {
  name: string
  address: string
  opentimes: string
  deliverycost: string
  orderswhatsappnumber: string
  ordersphonenumner: string
  notes: string
}

type Props = {
  initialShop: Shop
  initialProducts: Product[]
}

export default function EditShop({ initialShop, initialProducts }: Props) {
  const [shop, setShop] = useState(initialShop)
  const [tempShop, setTempShop] = useState(initialShop)
  const [products, setProducts] = useState(initialProducts)
  const [tempProducts, setTempProducts] = useState(initialProducts)
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState("")
  const [isSaving, setSaving] = useState(false)

  const width = useMemo(
    () => (typeof window !== "undefined" ? window.innerWidth : 1000),
    []
  )

  const showPreview = width > 1000
  // TODO: verify that we are showing an error message if needded
  // const isError = Object.keys(errors).length > 0
  const isError = false
  const methods = useForm({ mode: "onBlur" })

  const onSubmit: SubmitHandler<FormInputs> = (shopData) => {
    trimObject(shopData)

    const dataToSave = {
      ...shopData,
      products: tempProducts,
    }

    async function saveData() {
      setSaving(true)

      await fetch(`/api/shop/${shop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      })
        .then((response) => response.json())
        .then(({ shop, products }) => {
          setShop(shop)
          setProducts(products)
          setMessage("Tus datos fueron guardados")
        })
        .catch(() => setMessage("Error guardando tus datos"))

      setShowMessage(true)
      setSaving(false)
    }

    saveData()
  }

  const onMessagePress = () => setShowMessage(!showMessage)

  return (
    <View style={s.container}>
      <FormProvider {...methods}>
        <View style={s.editorContainer}>
          <Header
            shop={shop}
            onSubmit={onSubmit}
            isLoading={isSaving}
            setTempShop={setTempShop}
          />
          <EditShopForm shop={shop} setTempShop={setTempShop} />
          <EditProductsTable
            products={products}
            shopId={shop.id}
            setTempProducts={setTempProducts}
          />
        </View>

        {showPreview && (
          <View style={s.previewContainer}>
            <Preview shop={tempShop} products={tempProducts} />
          </View>
        )}
      </FormProvider>

      {showMessage && (
        <MessageBox
          message={
            isError
              ? "Hubo errores en los datos que ingresaste. Por favor revisalos y grabá nuevamente."
              : message
          }
          onMessagePress={onMessagePress}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightGrey2,
    flexDirection: "row",
    height: "100vh",
  },
  editorContainer: {
    backgroundColor: theme.colors.lightBackground,
    flex: 1,
    overflow: "scroll",
    padding: 40,
  },
  previewContainer: {
    overflow: "scroll",
    backgroundColor: theme.colors.lightGrey2,
    padding: 20,
    width: 400,
  },
})
