import React from "react";
import { Text, View } from "react-native";
import * as Icons from "../assets/icons/";

// TODO: Este componente tiene una responsabilidad difusa, mucha
// configuración externa. Repensar.

export default ({
  iconName,
  text,
  iconColor,
  textColor,
  fontSize,
  marginBottom,
}) => {
  const icons = {
    car: <Icons.Car color={iconColor} />,
    clock: <Icons.Clock color={iconColor} />,
    pin: <Icons.Pin color={iconColor} />,
  };

  const styles = {
    text: {
      padding: 3,
      color: textColor,
      fontFamily: "Roboto Slab",
      fontWeight: "400",
      fontSize: fontSize ?? 12,
      lineHeight: 14,
    },
    container: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      textAlignVertical: "center",
      marginBottom: marginBottom ?? 0,
    },
  };

  return (
    <View style={styles.container}>
      {icons[iconName]}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};
