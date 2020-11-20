import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

import theme from "../assets/theme";

const Input = React.forwardRef((props, ref) => {
  const { label, error, numberOfLies, value, ...inputProps } = props;
  let borderColor = error ? theme.colors.error : theme.colors.lightGrey2;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        autoCapitalize="none"
        placeholderTextColor={theme.colors.lighterBrown}
        ref={ref}
        style={[styles.input, { borderColor: borderColor }]}
        value={value}
        {...inputProps}
      />

      {error && <Text style={styles.textError}>{error.message}</Text>}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginTop: "0.25em",
  },
  input: {
    borderRadius: 2,
    borderWidth: 1,
    color: theme.colors.brown,
    fontFamily: "Barlow",
    fontSize: 15,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  label: {
    color: theme.colors.lightGrey3,
    fontFamily: "Barlow",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  textError: {
    color: theme.colors.error,
    fontSize: 15,
  },
});
