import React from "react";
import { Text, View } from "react-native";
import * as Icons from "../assets/icons/";

const DecoratedLabel = ({ iconName, text, iconColor, textColor, fontSize, marginBottom }) => {
  const icons = {
    car: <Icons.Car color={iconColor} width={18} />,
    clock: <Icons.Clock color={iconColor} width={18} />,
    pin: <Icons.Pin color={iconColor} width={18} />,
  };

  const styles = {
    text: {
      color: textColor,
      fontFamily: "Roboto Slab",
      fontWeight: "400",
      fontSize: fontSize ?? 12,
      lineHeight: 14,
      padding: 3,
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      textAlignVertical: "center",
      marginBottom: marginBottom ?? 0,
      maxWidth: "92%",
    },
  };

  return (
    <View style={styles.container}>
      {text && (
        <>
          <View>{icons[iconName]}</View>
          <Text style={styles.text}>{text}</Text>
        </>
      )}
    </View>
  );
};

// TODO: Este componente tiene una responsabilidad difusa, mucha
// configuración externa. Repensar.

export default DecoratedLabel;
