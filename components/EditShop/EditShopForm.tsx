import { useState } from "react"
import Modal from "react-bootstrap/Modal"
import { Controller } from "react-hook-form"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from "react-native"
import TimeAgo from "react-timeago"
import buildFormatter from "react-timeago/lib/formatters/buildFormatter"
import spanishStrings from "react-timeago/lib/language-strings/es"

import ShopInput from "./ShopInput"
import UploadImage from "./UploadImage"

import theme from "@/common/theme"
import { validatePhoneNumber } from "@/common/utils/utils"

export default function EditShopForm({
  shop,
  control,
  errors,
  handleSubmit,
  getValues,
  isSaving,
}) {
  const [imageType, setImageType] = useState(undefined)
  const formatter = buildFormatter(spanishStrings)

  const handleClose = () => {
    setImageType(undefined)
  }
  const handleShow = (type: string) => setImageType(type)

  const buttonStyles = {
    alignItems: "center",
    backgroundColor: isSaving ? theme.colors.lightGrey : theme.colors.button1,
    borderRadius: 5,
    flexDirection: "row",
    marginLeft: 15,
    marginVertical: 10,
    padding: 10,
  }

  const show = typeof imageType !== "undefined"

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <UploadImage
          shopID={shop.id}
          imageType={imageType}
          handleClose={handleClose}
        />
      </Modal>

      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>Datos de tu Comercio</Text>
            <Text style={styles.updatedAt}>
              <Text>Actualizado </Text>
              <TimeAgo
                date={shop.updated_at}
                formatter={formatter}
                minPeriod={60}
              />
            </Text>
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={() => handleShow("logo")}
              disabled={isSaving}
            >
              <Text style={styles.buttonUploadImage}>Editar logo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleShow("background")}
              disabled={isSaving}
            >
              <Text style={styles.buttonUploadImage}>Editar portada</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              style={buttonStyles}
              disabled={isSaving}
            >
              <>
                <Text style={styles.buttonText}>Guardar</Text>
                {isSaving && (
                  <ActivityIndicator
                    animating={isSaving}
                    color={theme.colors.white}
                  />
                )}
              </>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.formContainer}>
            <View style={styles.formColumnLeft}>
              <Controller
                render={({ field }) => (
                  <ShopInput
                    {...field}
                    label="Nombre del Comercio:"
                    error={errors.name}
                    maxLength={50}
                  />
                )}
                control={control}
                name="name"
                rules={{
                  required: {
                    value: true,
                    message: "El nombre del comercio es requerido.",
                  },
                }}
              />
              <Controller
                render={({ field }) => (
                  <ShopInput
                    {...field}
                    label="Dirección:"
                    error={errors.address}
                    maxLength={50}
                  />
                )}
                control={control}
                name="address"
              />
              <Controller
                render={({ field }) => (
                  <ShopInput
                    {...field}
                    label="Horario:"
                    error={errors.opentimes}
                    maxLength={50}
                  />
                )}
                control={control}
                name="opentimes"
              />
              <Controller
                render={({ field }) => (
                  <ShopInput
                    {...field}
                    label="Costo del Delivery:"
                    error={errors.deliverycost}
                    maxLength={50}
                  />
                )}
                control={control}
                name="deliverycost"
              />
            </View>

            <View style={styles.formColumnRight}>
              <Controller
                render={({ field }) => (
                  <ShopInput
                    {...field}
                    label="WhatsApp del comercio:"
                    error={errors.orderswhatsappnumber}
                    maxLength={20}
                    placeholder={"Escribilo así: +5492234470974"}
                    pattern={"\\+?[0-9]*"}
                    keyboardType={"phone-pad"}
                    onChange={([e]) => {
                      const value = e.target.value ?? ""
                      return value.replace(/[^0-9+]/g, "")
                    }}
                  />
                )}
                control={control}
                name="orderswhatsappnumber"
                rules={{
                  validate: {
                    matchesAtLeastAPhone: (value) => {
                      if (value != null && value !== "") {
                        const phoneValidationResult = validatePhoneNumber(value)
                        if (typeof phoneValidationResult === "string") {
                          return phoneValidationResult
                        }
                      }
                      const { ordersphonenumber } = getValues()
                      return (
                        (ordersphonenumber != null &&
                          ordersphonenumber !== "") ||
                        (value != null && value !== "") ||
                        "Al menos un número de teléfono debe ser ingresado."
                      )
                    },
                  },
                }}
              />
              <Controller
                render={({ field }) => (
                  <ShopInput
                    {...field}
                    label="Teléfono Fijo:"
                    error={errors.ordersphonenumber}
                    maxLength={20}
                    placeholder={"Escribilo así: +5492234470974"}
                    pattern={"\\+?[0-9]*"}
                    keyboardType={"phone-pad"}
                    onChange={([e]) => {
                      const value = e.target.value ?? ""
                      return value.replace(/[^0-9+]/g, "")
                    }}
                  />
                )}
                control={control}
                name="ordersphonenumber"
                rules={{
                  validate: {
                    matchesAtLeastAPhone: (value) => {
                      if (value != null && value !== "") {
                        const phoneValidationResult = validatePhoneNumber(value)
                        if (typeof phoneValidationResult === "string") {
                          return phoneValidationResult
                        }
                      }
                      const { orderswhatsappnumber } = getValues()
                      return (
                        (orderswhatsappnumber != null &&
                          orderswhatsappnumber !== "") ||
                        (value != null && value !== "") ||
                        "Al menos un número de teléfono debe ser ingresado."
                      )
                    },
                  },
                }}
              />
              <Controller
                render={({ field }) => (
                  <ShopInput
                    {...field}
                    placeholder="¿Querés hacer alguna aclaración?"
                    multiline
                    numberOfLines={3.5}
                    label="Notas:"
                    error={errors.notes}
                    maxLength={1000}
                  />
                )}
                control={control}
                name="notes"
              />
            </View>
          </View>
        </View>
      </View>
    </>
  )
}

type Styles = {
  buttonText: TextStyle
  buttonsContainer: ViewStyle
  buttonUploadImage: TextStyle
  container: ViewStyle
  formColumnLeft: ViewStyle
  formColumnRight: ViewStyle
  formContainer: ViewStyle
  title: TextStyle
  titleContainer: ViewStyle
  titleTextContainer: ViewStyle
  updatedAt: TextStyle
}

const styles = StyleSheet.create<Styles>({
  buttonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    alignItems: "baseline",
    flexDirection: "row",
  },
  buttonUploadImage: {
    borderRadius: 5,
    color: theme.colors.button1,
    fontFamily: "Barlow",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "600",
    marginHorizontal: 15,
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
  titleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  titleTextContainer: {
    alignItems: "baseline",
    flexDirection: "row",
  },
  updatedAt: {
    ...theme.text.quiet,
    marginHorizontal: 10,
  },
})
