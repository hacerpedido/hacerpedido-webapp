import { useState, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import {
  ViewStyle,
  TextStyle,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import TimeAgo from "react-timeago"
import buildFormatter from "react-timeago/lib/formatters/buildFormatter"
import spanishStrings from "react-timeago/lib/language-strings/es"

import UploadImageModal from "./UploadImageModal"

import theme from "lib/theme"
import type { Shop } from "types"
const IMAGE_TYPES = ["logo", "background"]

type Props = {
  shop: Shop
  onSubmit: () => void
  isLoading: boolean
  setTempShop: (shop: Shop | ((previous: Shop) => Shop)) => void
}

export default function Header({
  shop,
  onSubmit,
  isLoading,
  setTempShop,
}: Props) {
  const { handleSubmit } = useFormContext()
  const [modalImageType, setModalImageType] = useState("")

  const showModal = useMemo(
    () => IMAGE_TYPES.includes(modalImageType),
    [modalImageType]
  )

  const handleHideModal = () => setModalImageType("")

  const handleImageDelete = (imageType: string) => {
    const data = imageType == "logo" ? { logo: "" } : { background: "" }

    setTempShop((previous) => ({
      ...previous,
      ...data,
    }))

    handleHideModal()
  }

  const Title = () => (
    <View style={s.titleContainer}>
      <Text style={s.title}>Datos de tu Comercio</Text>

      <Text style={s.updatedAt}>
        <Text>Actualizado </Text>
        <TimeAgo
          date={shop.updated_at || ""}
          formatter={buildFormatter(spanishStrings)}
          minPeriod={60}
        />
      </Text>
    </View>
  )

  const UploadButton = ({ type }: { type: string }) => {
    const typeText = type === "logo" ? "logo" : "portada"

    return (
      <TouchableOpacity
        onPress={() => setModalImageType(type)}
        disabled={isLoading}
      >
        <Text style={s.uploadImageButton}>{`Editar ${typeText}`}</Text>
      </TouchableOpacity>
    )
  }

  const SubmitButton = () => (
    <TouchableOpacity
      onPress={handleSubmit(onSubmit)}
      style={buttonStyle(isLoading)}
      disabled={isLoading}
    >
      <Text style={s.buttonText}>Guardar</Text>
      {isLoading && (
        <ActivityIndicator animating={isLoading} color={theme.colors.white} />
      )}
    </TouchableOpacity>
  )

  return (
    <View style={s.header}>
      <Title />

      <View style={s.buttonsContainer}>
        <UploadButton type="logo" />
        <UploadButton type="background" />
        <SubmitButton />

        <UploadImageModal
          shopID={shop.id}
          imageType={modalImageType}
          image={modalImageType === "logo" ? shop.logo : shop.background}
          show={showModal}
          handleHide={handleHideModal}
          onImageDelete={handleImageDelete}
        />
      </View>
    </View>
  )
}

type Styles = {
  buttonText: TextStyle
  buttonsContainer: ViewStyle
  title: TextStyle
  header: ViewStyle
  titleContainer: TextStyle
  updatedAt: TextStyle
  uploadImageButton: ViewStyle
}
const buttonStyle = (isSaving: boolean): ViewStyle => ({
  alignItems: "center",
  backgroundColor: isSaving ? theme.colors.lightGrey : theme.colors.button1,
  borderRadius: 5,
  flexDirection: "row",
  marginLeft: 15,
  marginVertical: 10,
  padding: 10,
})

const s = StyleSheet.create<Styles>({
  buttonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    alignItems: "baseline",
    flexDirection: "row",
  },
  title: {
    ...theme.text.title,
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  titleContainer: {
    alignItems: "baseline",
    flexDirection: "row",
  },
  updatedAt: {
    ...theme.text.quiet,
    marginHorizontal: 10,
  },
  uploadImageButton: {
    borderRadius: 5,
    color: theme.colors.button1,
    fontFamily: "Barlow",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "600",
    marginHorizontal: 15,
  },
})
