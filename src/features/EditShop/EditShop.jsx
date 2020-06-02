import React from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { Controller } from "react-hook-form";

import Input from "components/Input";
import theme from "assets/theme";

export default ({ control, handleSubmit }) => {
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
            />
            <Controller
              as={Input}
              control={control}
              name="address"
              label="Dirección:"
            />
            <Controller
              as={Input}
              control={control}
              name="opentimes"
              label="Horario:"
            />
            <Controller
              as={Input}
              control={control}
              name="deliverycost"
              label="Costo del Delivery:"
            />
          </View>
          <View style={styles.formColumnRight}>
            <Controller
              as={Input}
              control={control}
              name="orderswhatsappnumber"
              label="Teléfono para WhatsApp:"
            />
            <Controller
              as={Input}
              control={control}
              name="ordersphonenumber"
              label="Teléfono Fijo:"
            />
            <Controller
              as={Input}
              control={control}
              placeholder={"¿Querés hacer alguna aclaración?"}
              name="notes"
              multiline
              numberOfLines={3.5}
              // onChangeText={(text) => setValue("notes", text)}
              label="Notas:"
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
