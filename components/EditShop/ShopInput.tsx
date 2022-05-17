import { forwardRef } from "react"
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native"

import theme from "@/lib/theme"

type MyInputProps = {
  label: string
  error: any
  numberOfLines?: number
}

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

const ShopInput = forwardRef<HTMLInputElement, MyInputProps & InputProps>(
  (props, ref) => {
    const { label, error, numberOfLines, ...inputProps }: MyInputProps = props

    const borderColor = error ? theme.colors.error : theme.colors.lightGrey2
    const height = numberOfLines ? numberOfLines * 31 : 40

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          autoCapitalize="none"
          ref={ref}
          style={[styles.input, { borderColor: borderColor, height: height }]}
          {...inputProps}
        />
        {error && <Text style={styles.textError}>{error.message}</Text>}
      </View>
    )
  }
)

ShopInput.displayName = "ShopInput"

export default ShopInput

type Styles = {
  container: ViewStyle
  input: ViewStyle
  label: TextStyle
  textError: TextStyle
}

const styles = StyleSheet.create<Styles>({
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
})
