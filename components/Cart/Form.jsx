import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { TouchableHighlight, StyleSheet, Text, View } from "react-native";
// import {useSpring, animated} from "react-spring";

import colors from "../../assets/colors";
// import {setName, setAddress, setNotes} from "reducers/cartSlice";
import Switch from "../Switch";
import Input from "../Input";
import { WhatsAppIcon } from "../../assets/icons";

const Form = ({ onSubmit }) => {
  const shop = useSelector((state) => state.shop.shop);
  const { name } = shop;
  const [takeaway, setTakeaway] = useState(false);

  const { handleSubmit, errors, control } = useForm({ mode: "onBlur" });

  const toggleTakeAway = () => {
    const value = !takeaway;
    setTakeaway(value);
  };

  // const animatedProps = useSpring({
  //   opacity: !takeaway ? 1 : 0,
  //   maxHeight: !takeaway ? 100 : 0,
  // })

  return (
    <View style={styles.container}>
      <Switch toggle={toggleTakeAway} value={takeaway} />

      <Controller
        as={Input}
        control={control}
        autofocus
        name="name"
        label="Tu Nombre"
        autoCompleteType="name"
        placeholder="¿Cómo te llamás?"
        defaultValue={""}
        rules={{
          required: {
            value: true,
            message: "Necesitamos tu nombre",
          },
        }}
        error={errors.name}
        maxLength={50}
      />

      {/* <AnimatedView style={animatedProps}> */}
      {takeaway || (
        <Controller
          as={Input}
          control={control}
          name="address"
          label="Tu Dirección"
          autoCompleteType="street-address"
          placeholder="¿A dónde lo mandamos?"
          defaultValue={""}
          rules={{
            required: {
              value: true,
              message: "Necesitamos tu dirección",
            },
          }}
          error={errors.address}
          maxLength={50}
        />
      )}
      {/* </AnimatedView> */}

      <Controller
        as={Input}
        control={control}
        name="notes"
        label="Notas"
        placeholder="¿Querés hacer alguna aclaración?"
        defaultValue={""}
        multiline
        numberOfLines={2}
        maxLength={500}
      />

      {/* eslint-disable react-native/no-raw-text */}
      <Text style={styles.notes}>
        Por favor,
        <Text style={textStyles.bold}> confirmá el precio final </Text>
        con el comercio. No somos responsables de modificaciones en el menú.
      </Text>
      {/* eslint-enable react-native/no-raw-text */}

      <TouchableHighlight onPress={handleSubmit(onSubmit)} underlayColor="none">
        <div className="bounza">
          <View style={[styles.buttonWhatsApp, styles.button]}>
            <Text style={styles.textContainer} numberOfLines={1}>
              <View style={styles.icon}>
                <WhatsAppIcon color={colors.white} />
              </View>
              <Text style={styles.buttonText}> Pedir a {name} </Text>
            </Text>
          </View>
        </div>
      </TouchableHighlight>
    </View>
  );
};

// const AnimatedView = animated(View)

export default Form;

const textStyles = {
  bold: {
    fontWeight: "bold",
  },
  smallText: {
    fontFamily: "Barlow",
    fontSize: 13,
  },
  largeText: {
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "600",
  },
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 19,
    paddingVertical: 17,
  },
  buttonText: {
    marginLeft: 5,
  },
  buttonWhatsApp: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.button1,
  },
  container: {
    backgroundColor: colors.white,
    paddingBottom: 30,
    paddingTop: 21,
  },
  icon: {
    top: 2,
  },
  notes: {
    ...textStyles.smallText,
    color: colors.gray4,
    textAlign: "center",
  },
  textContainer: {
    ...textStyles.largeText,
    alignItems: "center",
    color: colors.white,
    flexDirection: "row",
    justifyContent: "center",
  },
});
