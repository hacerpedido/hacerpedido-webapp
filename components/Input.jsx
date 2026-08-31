import React from "react";
import { View, TextInput, Text } from "react-native";
import styles from "./Input.module.css";

import theme from "../assets/theme";

const Input = React.forwardRef((props, ref) => {
  const { label, error, numberOfLies, value, ...inputProps } = props;
  let borderColor = error ? theme.colors.error : theme.colors.lightGrey2;

  return (
    <View classList={[styles.container]}>
      {label && <Text classList={[styles.label]}>{label}</Text>}

      <TextInput
        autoCapitalize="none"
        placeholderTextColor={theme.colors.lighterBrown}
        ref={ref}
        classList={[styles.input]}
        style={{ borderColor: borderColor }}
        value={value}
        {...inputProps}
      />

      {error && <Text classList={[styles.textError]}>{error.message}</Text>}
    </View>
  );
});

export default Input;
