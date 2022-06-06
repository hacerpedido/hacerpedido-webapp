import { useState } from "react"
import { useForm } from "react-hook-form"

import { View, StyleSheet, ViewStyle } from "react-native"

import theme from "@/lib/theme"

import EditProducts from "components/EditShop/EditProducts"
import EditShopForm from "components/EditShop/EditShopForm"
import Form from "components/Form"
import MessageBox from "components/MessageBox"
import Shop from "components/Shop/Shop"
import type { Shop as ShopType, Product } from "types"

type Props = {
  shop: ShopType
  products: Product[]
  message: string
  isSaving: boolean
  onSubmit: () => void
  setProducts: (products: Product[]) => void
}

export default function EditView({
  shop,
  products,
  message,
  isSaving,
  onSubmit,
  setProducts,
}: Props) {
  const [showMessage, setShowMessage] = useState(false)
  const width = typeof window !== "undefined" ? window.innerWidth : 1000
  const showPreview = width > 1000

  const {
    handleSubmit,
    register,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  })

  const isError = Object.keys(errors).length > 0

  function onMessagePress() {
    setShowMessage(!showMessage)
  }
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

        {showPreview && (
          <Shop shop={shop} products={products} isPreview={true} />
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
