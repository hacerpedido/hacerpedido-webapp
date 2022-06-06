import { useState } from "react"
import { StyleSheet, View } from "react-native"
// import { saveShopWithProducts } from "lib/api/shops"

import EditProducts from "components/EditShop/EditProducts"
import EditShopForm from "components/EditShop/EditShopForm"
import Preview from "components/EditShop/Preview"
import MessageBox from "components/MessageBox"
import theme from "lib/theme"
import { trimObject } from "lib/utils/utils"

export default function EditView({ shop, products }) {
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState("")
  const [isSaving, setSaving] = useState(false)
  // TODO: I moved watch to EditShop
  // const tempValues = watch()
  const tempProducts = products
  const width = typeof window !== "undefined" ? window.innerWidth : 1000
  const showPreview = width > 1000
  // const isError = Object.keys(errors).length > 0
  const isError = false

  const onSubmit = (data) => {
    trimObject(data)

    async function saveData() {
      setSaving(true)
      const dataToSave = {
        ...data,
        id: shop.id,
        slug: shop.slug,
        region: shop.region,
      }

      // const result = await saveShopWithProducts(token, dataToSave, tempProducts)
      const result = {}
      setMessage(result.message)

      if (result.error == null) {
        const editedShop = { ...shop, ...dataToSave }
        if (tempProducts != null) {
          editedShop.products = tempProducts
        }
        // setShopState({ shop: editedShop, loading: false })
      }

      setShowMessage(true)
      setSaving(false)
      refresh()
    }
    saveData()
  }
  function refresh() {
    // setShopState({ shop: null, loading: true })
    // setReloadCount(reloadCount + 1)
  }

  function onMessagePress() {
    setShowMessage(!showMessage)
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <EditShopForm
          shop={shop}
          onSubmit={onSubmit}
          isSaving={isSaving}
          refresh={refresh}
        />
        <EditProducts products={products} shopId={shop.id} />
      </View>

      {showPreview && (
        <View style={styles.rightContainer}>
          <Preview shop={shop} products={products} />
        </View>
      )}

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
