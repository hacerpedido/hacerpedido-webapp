import { colors } from "./colors"

const titleFont = { fontFamily: "Barlow", fontWeight: "600" }

const textStyles = {
  title: {
    ...titleFont,
    color: colors.black,
    fontSize: 24,
    fontStyle: "normal",
    lineHeight: 29,
  },
  quiet: {
    color: colors.lightGrey,
    fontFamily: "Barlow",
    fontSize: 12,
    fontStyle: "normal",
  },
}

const theme = {
  text: { ...textStyles },
  colors: { ...colors },
}

export default theme
