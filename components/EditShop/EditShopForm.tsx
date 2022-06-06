import React, { useState } from "react"
import Modal from "react-bootstrap/Modal"
import { useForm } from "react-hook-form"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import TimeAgo from "react-timeago"
import buildFormatter from "react-timeago/lib/formatters/buildFormatter"
import spanishStrings from "react-timeago/lib/language-strings/es"

import UploadImage from "./UploadImage"

import Input from "components/Input"
import theme from "lib/theme"
import { validatePhoneNumber } from "lib/utils/utils"

export default function EditShopForm({ shop, onSubmit, isSaving, refresh }) {
  const [imageType, setImageType] = useState(undefined)

  const formatter = buildFormatter(spanishStrings)

  const {
    handleSubmit,
    register,
    formState: { errors },
    getValues,
    watch,
  } = useForm({
    // TODO: Add default values (from localStorage)
    defaultValues: {
      name: shop.name,
      address: shop.address,
      opentimes: shop.opentimes,
      deliverycost: shop.deliverycost,
      orderswhatsappnumber: shop.orderswhatsappnumber,
      ordersphonenumber: shop.ordersphonenumber,
      notes: shop.notes,
    },
    mode: "onBlur",
  })

  const handleClose = (options = {}) => {
    setImageType(undefined)
    if (options.forceRefresh) {
      refresh()
    }
  }
  const handleShow = (type) => setImageType(type)

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
  const validation = {
    name: {
      required: {
        value: true,
        message: "El nombre del comercio es requerido.",
      },
    },
    orderswhatsappnumber: {
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
            (ordersphonenumber != null && ordersphonenumber !== "") ||
            (value != null && value !== "") ||
            "Al menos un número de teléfono debe ser ingresado."
          )
        },
      },
    },
    ordersphonenumber: {
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
            (orderswhatsappnumber != null && orderswhatsappnumber !== "") ||
            (value != null && value !== "") ||
            "Al menos un número de teléfono debe ser ingresado."
          )
        },
      },
    },
  }

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
              underlayColor={"none"}
              onPress={() => handleShow("logo")}
              disabled={isSaving}
            >
              <Text style={styles.uploadImageButton}>Editar logo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              underlayColor={"none"}
              onPress={() => handleShow("background")}
              disabled={isSaving}
            >
              <Text style={styles.uploadImageButton}>Editar portada</Text>
            </TouchableOpacity>
            <TouchableOpacity
              underlayColor={"none"}
              onPress={handleSubmit(onSubmit)}
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
              <Input
                {...register("name", validation["name"])}
                label="Nombre del Comercio:"
                error={errors.name}
                maxLength={50}
              />
              <Input
                {...register("address")}
                label="Dirección:"
                error={errors.address}
                maxLength={50}
              />
              <Input
                {...register("opentimes")}
                label="Horario:"
                error={errors.opentimes}
                maxLength={50}
              />
              <Input
                name="deliverycost"
                label="Costo del Delivery:"
                error={errors.deliverycost}
                maxLength={50}
              />
            </View>
            <View style={styles.formColumnRight}>
              <Input
                {...register(
                  "orderswhatsappnumber",
                  validation["orderswhatsappnumber"]
                )}
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
              <Input
                {...register(
                  "ordersphonenumber",
                  validation["ordersphonenumber"]
                )}
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
              <Input
                placeholder={"¿Querés hacer alguna aclaración?"}
                {...register("notes")}
                multiline
                numberOfLines={3.5}
                label="Notas:"
                error={errors.notes}
                maxLength={1000}
              />
            </View>
          </View>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
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
