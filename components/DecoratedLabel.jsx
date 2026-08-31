import React from "react";
import { Text, View } from "react-native";
import * as Icons from "../assets/icons/";
import styles from "./DecoratedLabel.module.css";

// TODO: Este componente tiene una responsabilidad difusa, mucha
// configuración externa. Repensar.

const DecoratedLabel = ({ iconName, text, iconColor, textColor, fontSize, marginBottom }) => {
  const icons = {
    car: <Icons.Car color={iconColor} width={18} />,
    clock: <Icons.Clock color={iconColor} width={18} />,
    pin: <Icons.Pin color={iconColor} width={18} />,
  };

  var displayText = text;
  if (displayText.trim() === "") {
    displayText = null;
  }

  return (
    <View className={styles.container} style={{ marginBottom: marginBottom ?? 0 }}>
      {displayText && (
        <>
          <View>{icons[iconName]}</View>
          <Text className={styles.text} style={{ color: textColor, fontSize: fontSize ?? 12 }}>
            {displayText}
          </Text>
        </>
      )}
    </View>
  );
};

export default DecoratedLabel;
