import colors from "./colors";

const titleFont = { fontFamily: "Barlow", fontWeight: "600" };

const textStyles = {
  title: {
    ...titleFont,
    color: colors.black,
    fontSize: 24,
    fontStyle: "normal",
    lineHeight: 29,
  },
};

export default {
  text: { ...textStyles },
  colors: { ...colors },
};
