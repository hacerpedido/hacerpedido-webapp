import React from "react";
import { useDispatch } from "react-redux";
import { Text, View, StyleSheet, Button } from "react-native";
import { Controller } from "react-hook-form";

import Input from "components/Input";
import { setTempShop } from "redux/shopEditSlice";
import { query } from "redux/shopsSlice";
import { saveShop } from "api/shops";

import theme from "assets/theme";

export default ({ shop, watch, control, handleSubmit }) => {
  const dispatch = useDispatch();

  const onSubmit = (data) => {
    let dataToSave = {
      ...data,
      id: shop.id,
      slug: shop.slug,
      region: shop.region,
    };

    // console.log(editedShop);
    // alert(JSON.stringify(data));
    saveShop(dataToSave);

    let editedShop = { ...shop, ...dataToSave };
    dispatch(query([editedShop]));
  };

  let isDirty = false;
  const tempValues = watch();
  for (var key in tempValues) {
    if (tempValues[key] !== shop[key]) {
      console.log(key + " : " + tempValues[key]);
      isDirty = true;
      break;
    }
  }

  if (isDirty) {
    dispatch(setTempShop({ id: shop.id, values: tempValues }));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Datos de tu Comercio</Text>
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
              placeholder={"¿Querés hacer alguna aclaración?"}
              name="notes"
              multiline
              numberOfLines={4}
              // onChangeText={(text) => setValue("notes", text)}
              label="Notas:"
            />
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
            {/*
                    logo
                    background
                  */}

            <Button title="Grabar" onPress={handleSubmit(onSubmit)} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightBackground,
    justifyContent: "center",
    paddingTop: 10,
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
});
