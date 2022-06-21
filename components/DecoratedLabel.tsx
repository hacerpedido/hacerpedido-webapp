import type { ReactNode } from "react"
import { StyleSheet, Text, TextStyle } from "react-native"

import { CarIcon, ClockIcon, PinIcon } from "@/components/icons/"

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
}: Props) => {
  type Styles = {
    text: TextStyle
  }

  const styles = StyleSheet.create<Styles>({
    text: {
      color: textColor,
      fontFamily: "Roboto Slab",
      fontSize: fontSize,
      lineHeight: 14,
      padding: 3,
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
    <Text style={styles.text}>
      {iconList[iconName]}
      {text}
    </Text>
  )
}

export default DecoratedLabel
