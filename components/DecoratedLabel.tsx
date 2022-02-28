import type { ReactNode } from "react"
import { StyleSheet, Text, View, TextStyle, ViewStyle } from "react-native"

import { CarIcon, ClockIcon, PinIcon } from "../assets/icons/"

// TODO: Este componente tiene una responsabilidad difusa, mucha

type Props = {
  iconName: string
  text: string
  iconColor: string
  textColor: string
  fontSize?: number
  marginBottom?: number
}

const DecoratedLabel = ({
  iconName,
  text,
  iconColor,
  textColor,
  fontSize = 12,
  marginBottom = 0,
}: Props) => {
  type Styles = {
    container: ViewStyle
    text: TextStyle
  }

  const styles = StyleSheet.create<Styles>({
    text: {
      color: textColor,
      fontFamily: "Roboto Slab",
      fontWeight: "400",
      fontSize: fontSize,
      lineHeight: 14,
      padding: 3,
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      textAlignVertical: "center",
      marginBottom: marginBottom,
      maxWidth: "92%",
    },
  })

  type IconList = {
    // [key: "car" | "clock" | "pin"]: ReactNode
    [key: string]: ReactNode
  }

  const iconList: IconList = {
    car: <CarIcon color={iconColor} width={18} />,
    clock: <ClockIcon color={iconColor} width={18} />,
    pin: <PinIcon color={iconColor} width={18} />,
  }

  return (
    <View style={styles.container}>
      {text && (
        <>
          <View>{iconList[iconName]}</View>
          <Text style={styles.text}>{text}</Text>
        </>
      )}
    </View>
  )
}

export default DecoratedLabel
