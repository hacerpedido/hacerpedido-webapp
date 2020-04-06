import React from "react";
import { View } from "react-native";
import { Text } from "@ui-kitten/components";
import * as Icons from "../assets/icons/";

export default function DecoratedLabel({ iconName, text, color }) {
  const icons = {
    car: <Icons.Car color={color} />,
    clock: <Icons.Clock color={color} />,
    pin: <Icons.Pin color={color} />
  };

  const styles = {
    text: {
      padding: 3,
      color: color,
      fontFamily: "RobotoSlab",
      fontWeight: "500"
    }
  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        textAlignVertical: "center"
      }}
    >
      {icons[iconName]}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
