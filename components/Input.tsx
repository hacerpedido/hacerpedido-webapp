import { forwardRef } from "react"
import { View, Text, StyleSheet, TextStyle, ViewStyle } from "react-native"

import theme from "@/common/theme"

// NOTE: https://react-hook-form.com/ts/

type MyInputProps = {
  label: string
  error: any
}

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

const Input = forwardRef<HTMLInputElement, MyInputProps & InputProps>(
  (props, ref) => {
    const { label, error, ...inputProps }: MyInputProps = props
    const borderColor = error ? theme.colors.error : theme.colors.lightGrey2

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}

        <input
          style={[styles.input, { borderColor: borderColor }]}
          ref={ref}
          {...inputProps}
        />

        {error && <Text style={styles.textError}>{error.message}</Text>}
      </View>
    )
  }
)

Input.displayName = "Input"

export default Input

type Styles = {
  container: ViewStyle
  input: ViewStyle
  label: TextStyle
  textError: TextStyle
}

const styles = StyleSheet.create<Styles>({
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
