import React from "react";
import { View } from "react-native";
import { Icon, Text } from "@ui-kitten/components";

export default function DecoratedLabel({ iconName, text, style }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center"
      }}
    >
      <Icon name={iconName} width={14} height={14} />
      <Text style={style}>{text}</Text>
    </View>
  );
}
