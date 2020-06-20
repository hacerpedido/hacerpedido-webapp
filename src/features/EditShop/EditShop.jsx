import React from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { Controller } from "react-hook-form";

import Input from "components/ShopInput";
import theme from "assets/theme";
import { validatePhoneNumber } from "utils/utils";

export default ({ shop, control, errors, handleSubmit, getValues }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Datos de tu Comercio</Text>
        <Button style={styles.button} title="Grabar" onPress={handleSubmit} />
      </View>
      <View style={styles.formContainer}>
        <View style={styles.formContainer}>
          <View style={styles.formColumnLeft}>
            <Controller
              as={Input}
              control={control}
              name="name"
              label="Nombre del Comercio:"
              defaultValue={shop.name}
              rules={{
                required: {
                  value: true,
                  message: "El nombre del comercio es requerido.",
                },
              }}
              error={errors.name}
            />
            <Controller
              as={Input}
              control={control}
              name="address"
              label="Dirección:"
              defaultValue={shop.address}
              // rules={{
              //   required: {
              //     value: true,
              //     message:
              //       "Ingresá la dirección del comercio o ingresá 'NO' en caso que sólo hagas delivery.",
              //   },
              // }}
              error={errors.address}
            />
            <Controller
              as={Input}
              control={control}
              name="opentimes"
              label="Horario:"
              defaultValue={shop.opentimes}
              error={errors.opentimes}
            />
            <Controller
              as={Input}
              control={control}
              name="deliverycost"
              label="Costo del Delivery:"
              defaultValue={shop.deliverycost}
              error={errors.deliverycost}
            />
          </View>
          <View style={styles.formColumnRight}>
            <Controller
              as={Input}
              control={control}
              name="orderswhatsappnumber"
              label="Teléfono para WhatsApp:"
              defaultValue={shop.orderswhatsappnumber}
              error={errors.orderswhatsappnumber}
              rules={{ validate: validatePhoneNumber }}
            />
            <Controller
              as={Input}
              control={control}
              name="ordersphonenumber"
              label="Teléfono Fijo:"
              defaultValue={shop.ordersphonenumber}
              error={errors.ordersphonenumber}
              rules={{
                validate: {
                  matchesAtLeastAPhone: (value) => {
                    const phoneValidationResult = validatePhoneNumber(value);
                    if (typeof phoneValidationResult === "string") {
                      return phoneValidationResult;
                    }
                    const { orderswhatsappnumber } = getValues();
                    return (
                      orderswhatsappnumber !== "" ||
                      value !== "" ||
                      "Al menos un número de teléfono debe ser ingresado."
                    );
                  },
                },
              }}
            />
            <Controller
              as={Input}
              control={control}
              placeholder={"¿Querés hacer alguna aclaración?"}
              name="notes"
              multiline
              numberOfLines={3.5}
              label="Notas:"
              defaultValue={shop.notes}
              error={errors.notes}
            />
            {/*
                logo
                background
            */}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {},
  container: {
    backgroundColor: theme.colors.lightBackground,
    justifyContent: "center",
  },
  formColumnLeft: {
    backgroundColor: theme.colors.white,
    flex: 0.5,
    marginRight: 8,
  },
  formColumnRight: {
    backgroundColor: theme.colors.white,
    flex: 0.5,
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    flex: 1,
    flexDirection: "row",
  },
  title: {
    ...theme.text.title,
    marginVertical: 10,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
