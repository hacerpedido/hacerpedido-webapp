import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import type { SubmitHandler } from "react-hook-form"
import { StyleSheet, View } from "react-native"

import EditProductsTable from "components/EditShop/EditProductsTable"
import EditShopForm from "components/EditShop/EditShopForm"
import Preview from "components/EditShop/Preview"
import MessageBox from "components/MessageBox"
import theme from "lib/theme"
import { trimObject } from "lib/utils/utils"
import type { Shop, Product } from "types"

type Props = {
  initialShop: Shop
  initialProducts: Product[]
}

export default function EditView({ initialShop, initialProducts }: Props) {
  const [shop, setShop] = useState(initialShop)
  const [tempShop, setTempShop] = useState(initialShop)
  const [products, setProducts] = useState(initialProducts)
  const [tempProducts, setTempProducts] = useState(initialProducts)
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState("")
  const [isSaving, setSaving] = useState(false)
  const width = typeof window !== "undefined" ? window.innerWidth : 1000
  const showPreview = width > 1000
  // TODO: verify that we are showing an error message if needded
  // const isError = Object.keys(errors).length > 0
  const isError = false

  type FormInputs = {
    name: string
    address: string
    opentimes: string
    deliverycost: string
    orderswhatsappnumber: string
    ordersphonenumner: string
    notes: string
  }

  type ShopWithProducts = FormInputs & {
    products: Product[]
  }

  const methods = useForm({ mode: "onBlur" })

  async function saveShopWithProducts(shopWithProducts: ShopWithProducts) {
    await fetch(`/api/shop/${shop.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shopWithProducts),
    })
      .then((response) => response.json())
      .then(({ shop, products }) => {
        setShop(shop)
        setProducts(products)
        setMessage("Tus datos fueron guardados")
      })
      .catch(() => setMessage("Error guardando tus datos"))
  }

  const onSubmit: SubmitHandler<FormInputs> = (shopData) => {
    trimObject(shopData)

    const dataToSave = {
      ...shopData,
      products: tempProducts,
    }

    async function saveData() {
      setSaving(true)
      await saveShopWithProducts(dataToSave)
      setShowMessage(true)
      setSaving(false)
    }

    saveData()
  }

  function onMessagePress() {
    setShowMessage(!showMessage)
  }

  return (
    <View style={styles.container}>
      <FormProvider {...methods}>
        <View style={styles.leftContainer}>
          <EditShopForm
            shop={shop}
            setTempShop={setTempShop}
            onSubmit={onSubmit}
            isSaving={isSaving}
          />
          <EditProductsTable
            products={products}
            shopId={shop.id}
            setTempProducts={setTempProducts}
          />
        </View>

        {showPreview && (
          <View style={styles.rightContainer}>
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
          isError={isError}
          onMessagePress={onMessagePress}
        />
      )}
    </View>
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
    overflow: "scroll",
    padding: 40,
  },
  rightContainer: {
    overflow: "scroll",
    backgroundColor: theme.colors.lightGrey2,
    padding: 30,
    width: 400,
  },
})
