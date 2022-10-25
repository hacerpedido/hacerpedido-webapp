import { useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from "react-native"
import TimeAgo from "react-timeago"
import buildFormatter from "react-timeago/lib/formatters/buildFormatter"
import spanishStrings from "react-timeago/lib/language-strings/es"

import UploadImageModal from "./UploadImageModal"

import Input from "components/Input"
import theme from "lib/theme"
import { validatePhoneNumber } from "lib/utils/utils"

import type { Shop } from "types"

type Props = {
  shop: Shop
  onSubmit: () => void
  isSaving: boolean
  setTempShop: (shop: Shop) => void
}

export default function EditShopForm({
  shop,
  onSubmit,
  isSaving,
  setTempShop,
}: Props) {
  const formatter = buildFormatter(spanishStrings)
  const [showModal, setShowModal] = useState(false)
  const [imageType, setImageType] = useState("")

  const {
    handleSubmit,
    register,
    formState: { errors },
    getValues,
  } = useFormContext()

  const tempValues = useWatch()

  useEffect(() => {
    setTempShop({ ...shop, ...tempValues })
  }, [setTempShop, shop, tempValues])

  useEffect(() => {
    setShowModal(["logo", "background"].includes(imageType))
  }, [imageType])

  const handleCloseModal = () => setImageType("")

  const validation = {
    name: {
      required: {
        value: true,
        message: "El nombre del comercio es requerido.",
      },
    },
    orderswhatsappnumber: {
      validate: {
        matchesAtLeastAPhone: (value: string) => {
          if (value != null && value !== "") {
            const phoneValidationResult = validatePhoneNumber(value)
            if (typeof phoneValidationResult === "string") {
              return phoneValidationResult
            }
          }
          const { ordersphonenumber } = getValues()
          return (
            (ordersphonenumber != null && ordersphonenumber !== "") ||
            (value != null && value !== "") ||
            "Al menos un número de teléfono debe ser ingresado."
          )
        },
      },
    },
    ordersphonenumber: {
      validate: {
        matchesAtLeastAPhone: (value: string) => {
          if (value != null && value !== "") {
            const phoneValidationResult = validatePhoneNumber(value)
            if (typeof phoneValidationResult === "string") {
              return phoneValidationResult
            }
          }

          const { orderswhatsappnumber } = getValues()

          return (
            (orderswhatsappnumber != null && orderswhatsappnumber !== "") ||
            (value != null && value !== "") ||
            "Al menos un número de teléfono debe ser ingresado."
          )
        },
      },
    },
  }

  const Actions = () => (
    <View style={s.buttonsContainer}>
      <TouchableOpacity
        onPress={() => setImageType("logo")}
        disabled={isSaving}
      >
        <Text style={s.uploadImageButton}>Editar logo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setImageType("background")}
        disabled={isSaving}
      >
        <Text style={s.uploadImageButton}>Editar portada</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        style={s.buttonStyles(isSaving)}
        disabled={isSaving}
      >
        <Text style={s.buttonText}>Guardar</Text>
        {isSaving && (
          <ActivityIndicator animating={isSaving} color={theme.colors.white} />
        )}
      </TouchableOpacity>

      <UploadImageModal
        shopID={shop.id}
        imageType={imageType}
        image={imageType === "logo" ? shop.logo : shop.background}
        show={showModal}
        onHide={handleCloseModal}
      />
    </View>
  )

  const Form = () => (
    <View style={s.formContainer}>
      <View style={s.formContainer}>
        <View style={s.formColumnLeft}>
          <Input
            {...register("name", validation["name"])}
            label="Nombre del Comercio:"
            defaultValue={shop.name}
            error={errors.name}
            maxLength={50}
          />
          <Input
            {...register("address")}
            label="Dirección:"
            defaultValue={shop.address}
            error={errors.address}
            maxLength={50}
          />
          <Input
            {...register("opentimes")}
            label="Horario:"
            defaultValue={shop.opentimes}
            error={errors.opentimes}
            maxLength={50}
          />
          <Input
            {...register("deliverycost")}
            label="Costo del Delivery:"
            defaultValue={shop.deliverycost}
            error={errors.deliverycost}
            maxLength={50}
          />
        </View>

        <View style={s.formColumnRight}>
          <Input
            {...register(
              "orderswhatsappnumber",
              validation["orderswhatsappnumber"]
            )}
            label="WhatsApp del comercio:"
            defaultValue={shop.orderswhatsappnumber}
            error={errors.orderswhatsappnumber}
            placeholder={"Escribilo así: +5492234470974"}
            // keyboardType={"phone-pad"}
            onChange={(event) => {
              const value = event.target.value ?? ""
              return value.replace(/[^0-9+]/g, "")
            }}
            maxLength={20}
            pattern={"\\+?[0-9]*"}
          />
          <Input
            {...register("ordersphonenumber", validation["ordersphonenumber"])}
            label="Teléfono Fijo:"
            defaultValue={shop.ordersphonenumber}
            error={errors.ordersphonenumber}
            maxLength={20}
            placeholder={"Escribilo así: +5492234470974"}
            pattern={"\\+?[0-9]*"}
            // keyboardType={"phone-pad"}
            onChange={(event) => {
              const value = event.target.value ?? ""
              return value.replace(/[^0-9+]/g, "")
            }}
          />
          <Input
            placeholder={"¿Querés hacer alguna aclaración?"}
            {...register("notes")}
            label="Notas:"
            defaultValue={shop.notes}
            error={errors.notes}
            maxLength={1000}
            // multiline
            // numberOfLines={3.5}
          />
        </View>
      </View>
    </View>
  )

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.titleContainer}>
          <Text style={s.title}>Datos de tu Comercio</Text>
          <Text style={s.updatedAt}>
            <Text>Actualizado </Text>
            <TimeAgo
              date={shop?.updated_at || ""}
              formatter={formatter}
              minPeriod={60}
            />
          </Text>
        </View>

        <Actions />
      </View>

      <Form />
    </View>
  )
}

type Styles = {
  buttonText: TextStyle
  buttonsContainer: ViewStyle
  buttonStyles: ViewStyle
  container: ViewStyle
  formColumnLeft: ViewStyle
  formColumnRight: ViewStyle
  formContainer: ViewStyle
  title: TextStyle
  header: ViewStyle
  titleContainer: TextStyle
  updatedAt: TextStyle
  uploadImageButton: ViewStyle
}

const s = StyleSheet.create<Styles>({
  buttonStyles: (isSaving: boolean) => ({
    alignItems: "center",
    backgroundColor: isSaving ? theme.colors.lightGrey : theme.colors.button1,
    borderRadius: 5,
    flexDirection: "row",
    marginLeft: 15,
    marginVertical: 10,
    padding: 10,
  }),
  buttonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    alignItems: "baseline",
    flexDirection: "row",
  },
  container: {
    backgroundColor: theme.colors.lightBackground,
    justifyContent: "center",
  },
  formColumnLeft: {
    backgroundColor: theme.colors.white,
    flex: 0.5,
    marginRight: 8,
    paddingLeft: 20,
    paddingVertical: 20,
  },
  formColumnRight: {
    backgroundColor: theme.colors.white,
    flex: 0.5,
    padding: 20,
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.gray2,
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 1,
    flex: 1,
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
