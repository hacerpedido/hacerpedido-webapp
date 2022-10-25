import type { ReactNode } from "react"
import { StyleSheet, Text, TextStyle } from "react-native-web"

import { CarIcon, ClockIcon, PinIcon } from "@/components/icons/"

type IconList = {
  // [key: "car" | "clock" | "pin"]: ReactNode
  [key: string]: ReactNode
}

// TODO: Este componente tiene una responsabilidad difusa
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
  const iconList: IconList = {
    car: <CarIcon color={iconColor} width={18} />,
    clock: <ClockIcon color={iconColor} width={18} />,
    pin: <PinIcon color={iconColor} width={18} />,
  }

  return (
    <Text style={s.text(textColor, fontSize)}>
      {iconList[iconName]}
      {text}
    </Text>
  )
}

type Styles = {
  text: TextStyle
}

const s = StyleSheet.create<Styles>({
  text: (textColor: string, fontSize: number) => ({
    color: textColor,
    fontFamily: "Roboto Slab",
    fontSize: fontSize,
    lineHeight: 14,
    padding: 3,
  }),
})

export default DecoratedLabel
