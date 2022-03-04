import { forwardRef } from "react"
import { View, TextInput, Text, StyleSheet } from "react-native"

import theme from "@/common/theme"

// NOTE: https://react-hook-form.com/ts/

// eslint-disable-next-line react/display-name
const Input = forwardRef((props, ref) => {
  const { label, error, value, ...inputProps } = props
  const borderColor = error ? theme.colors.error : theme.colors.lightGrey2

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
  )
})

export default Input

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
})
