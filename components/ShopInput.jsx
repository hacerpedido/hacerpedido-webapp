import React from "react";
import { View, TextInput, Text } from "react-native";
import styles from "./ShopInput.module.css";

import theme from "../assets/theme";

const ShopInput = React.forwardRef((props, ref) => {
  const { label, error, numberOfLines, value, ...inputProps } = props;

  let borderColor = error ? theme.colors.error : theme.colors.lightGrey2;
  let height = numberOfLines ? numberOfLines * 31 : 40;

  return (
    <View classList={[styles.container]}>
      {label && <Text classList={[styles.label]}>{label}</Text>}
      <TextInput
        autoCapitalize="none"
        ref={ref}
        classList={[styles.input]}
        style={{ borderColor: borderColor, height: height }}
        value={value || ""}
        {...inputProps}
      />
      {error && <Text classList={[styles.textError]}>{error.message}</Text>}
    </View>
  );
});

export default ShopInput;
