import React from "react";
import { useDispatch } from "react-redux";
import { Text, View, StyleSheet, Button, ScrollView } from "react-native";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm, Controller } from "react-hook-form";
import { useHistory } from "react-router-dom";

import Input from "../../components/Input";
import Form from "../../components/Form";
import validation from "./validation";
import { setTempShop } from "../../redux/shopEditSlice";
import { setShop } from "../../redux/shopSlice";
import { loading } from "../../redux/homeSlice";
import { saveShop } from "../../api/shops";

import theme from "../../assets/theme";

export default ({ shop, products }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { handleSubmit, register, setValue, errors, control, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      ...shop,
    },
  });

  const onSubmit = (data) => {
    let dataToSave = {
      ...data,
      id: shop.id,
      slug: shop.slug,
      region: shop.region,
    };

    let editedShop = { ...shop, ...dataToSave };
    // console.log(editedShop);
    // alert(JSON.stringify(data));
    saveShop(dataToSave, history);
    dispatch(loading(false));
    dispatch(setShop([editedShop]));
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
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.formContainer}>
            <Form {...{ register, validation, setValue, errors, control }}>
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
            </Form>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightBackground,
    flex: 1,
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
