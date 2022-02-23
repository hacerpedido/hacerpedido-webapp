import { Text, View } from "react-native";
import { CarIcon, ClockIcon, PinIcon } from "../assets/icons/";

// TODO: Este componente tiene una responsabilidad difusa, mucha
// configuración externa. Repensar.

const DecoratedLabel = ({ iconName, text, iconColor, textColor, fontSize, marginBottom }) => {
  const icons = {
    car: <CarIcon color={iconColor} width={18} />,
    clock: <ClockIcon color={iconColor} width={18} />,
    pin: <PinIcon color={iconColor} width={18} />,
  };

  var displayText = text;
  if (displayText.trim() === "") {
    displayText = null;
  }

  const styles = {
    text: {
      color: textColor,
      fontFamily: "Roboto Slab",
      fontWeight: "400",
      fontSize: fontSize ?? 12,
      lineHeight: 14,
      padding: 3,
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      textAlignVertical: "center",
      marginBottom: marginBottom ?? 0,
      maxWidth: "92%",
    },
  };

  return (
    <View style={styles.container}>
      {displayText && (
        <>
          <View>{icons[iconName]}</View>
          <Text style={styles.text}>{displayText}</Text>
        </>
      )}
    </View>
  );
};

export default DecoratedLabel;
