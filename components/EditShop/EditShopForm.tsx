import { useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { View, ViewStyle, TextStyle, StyleSheet } from "react-native"

import Input from "components/Input"
import theme from "lib/theme"
import { validatePhoneNumber } from "lib/utils/utils"

import type { Shop } from "types"

type Props = {
  shop: Shop
  setTempShop: (shop: Shop) => void
}

export default function EditShopForm({ shop, setTempShop }: Props) {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext()

  const tempValues = useWatch()

  useEffect(() => {
    setTempShop({ ...shop, ...tempValues })
  }, [setTempShop, shop, tempValues])

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

  return (
    <View>
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
}

type Styles = {
  formColumnLeft: ViewStyle
  formColumnRight: ViewStyle
  formContainer: ViewStyle
}

const s = StyleSheet.create<Styles>({
  formContainer: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.gray2,
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 1,
    flexDirection: "row",
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
})
