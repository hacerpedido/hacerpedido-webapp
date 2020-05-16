import * as React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

import theme from "../assets/theme";

export default React.forwardRef((props, ref) => {
  const { label, error, numberOfLines, value, ...inputProps } = props;

  let borderColor = error ? theme.colors.error : theme.colors.lightGrey2;
  let height = numberOfLines ? numberOfLines * 31 : 40;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        autoCapitalize="none"
        ref={ref}
        style={[styles.input, { borderColor: borderColor, height: height }]}
        value={value || ""}
        {...inputProps}
      />
      {error && <Text style={styles.textError}>{error.message}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  input: {
    borderRadius: 3,
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 16,
    paddingLeft: 5,
    paddingVertical: 5,
  },
  label: {
    color: theme.colors.lightGrey,
    fontSize: 14,
    paddingVertical: 5,
  },
  textError: {
    color: theme.colors.error,
    fontSize: 14,
  },
});
