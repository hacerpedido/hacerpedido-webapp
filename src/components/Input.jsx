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
    marginVertical: "0.25em",
  },
  input: {
    borderRadius: 3,
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: "1em",
    paddingLeft: "0.5em",
    paddingVertical: "0.25em",
  },
  label: {
    color: theme.colors.lightGrey,
    fontSize: "0.75em",
    paddingVertical: "0.25em",
  },
  textError: {
    color: theme.colors.error,
    fontSize: "0.75em",
  },
});
