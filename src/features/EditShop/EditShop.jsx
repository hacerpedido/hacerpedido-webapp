import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { Controller } from "react-hook-form";

import Input from "components/ShopInput";
import theme from "assets/theme";
import { validatePhoneNumber } from "utils/utils";

export default ({ shop, control, errors, handleSubmit, getValues }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Datos de tu Comercio</Text>
        <TouchableHighlight
          underlayColor={"none"}
          onPress={handleSubmit}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableHighlight>
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
              maxLength={50}
            />
            <Controller
              as={Input}
              control={control}
              name="address"
              label="Dirección:"
              defaultValue={shop.address}
              error={errors.address}
              maxLength={50}
            />
            <Controller
              as={Input}
              control={control}
              name="opentimes"
              label="Horario:"
              defaultValue={shop.opentimes}
              error={errors.opentimes}
              maxLength={50}
            />
            <Controller
              as={Input}
              control={control}
              name="deliverycost"
              label="Costo del Delivery:"
              defaultValue={shop.deliverycost}
              error={errors.deliverycost}
              maxLength={50}
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
              maxLength={20}
            />
            <Controller
              as={Input}
              control={control}
              name="ordersphonenumber"
              label="Teléfono Fijo:"
              defaultValue={shop.ordersphonenumber}
              error={errors.ordersphonenumber}
              maxLength={20}
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
  button: {
    alignItems: "center",
    backgroundColor: theme.colors.button1,
    borderRadius: 5,
    marginVertical: 10,
    padding: 10,
    width: 100,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: "bold",
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
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
