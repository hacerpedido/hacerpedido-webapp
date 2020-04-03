import React from "react";
import { View } from "react-native";
import { TopNavigation, useTheme } from "@ui-kitten/components";
import { Link } from "react-router-dom";

export default function HomeHeader() {
  // const onBackPress = () => {
  // };

  const renderLeftControl = () => (
    <View style={{ padding: 12 }}>
      <Link to="/">HacerPedidos.com</Link>
    </View>
    // <BackAction onPress={onBackPress}/>
  );

  const renderRightControl = () => (
    <View style={{ padding: 12 }}>
      <Link to="/start">Suma tu comercio</Link>
    </View>
  );

  const theme = useTheme();

  return (
    <TopNavigation
      style={{ backgroundColor: theme["color-primary-default"] }}
      leftControl={renderLeftControl()}
      rightControls={renderRightControl()}
    />
  );
}
