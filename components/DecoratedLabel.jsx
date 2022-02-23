import { Text, View } from "react-native";
import { CarIcon, ClockIcon, PinIcon } from "../assets/icons/";

// TODO: Este componente tiene una responsabilidad difusa, mucha

// interface IDecoratedLabelProps {
//   iconName: string;
//   text: string
//   iconColor: string
//   textColor: string
//   fontSize: number
//   marginBottom: number
// }

// const DecoratedLabel = ({ iconName, text, iconColor, textColor, fontSize = 12, marginBottom = 0 }: IDecoratedLabelProps) => {
const DecoratedLabel = ({ iconName, text, iconColor, textColor, fontSize = 12, marginBottom = 0 }) => {
  const icons = {
    car: <CarIcon color={iconColor} width={18} />,
    clock: <ClockIcon color={iconColor} width={18} />,
    pin: <PinIcon color={iconColor} width={18} />,
  };

  const styles = {
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
  };

  return (
    <View style={styles.container}>
      {text && (
        <>
          <View>{icons[iconName]}</View>
          <Text style={styles.text}>{text}</Text>
        </>
      )}
    </View>
  );
};

export default DecoratedLabel;
