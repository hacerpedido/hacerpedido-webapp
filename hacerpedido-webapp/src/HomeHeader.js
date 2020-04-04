import React from "react";
import { View } from "react-native";
import {
  Icon,
  TopNavigation,
  TopNavigationAction,
  useTheme
} from "@ui-kitten/components";
import { Link, useHistory } from "react-router-dom";

export default function HomeHeader() {
  const history = useHistory();
  const theme = useTheme();

  const BackIcon = style => <Icon name="logo" width={54} height={24} />;

  const BackAction = props => (
    <TopNavigationAction {...props} icon={BackIcon} />
  );

  const renderLeftControl = () => (
    <BackAction
      onPress={() => {
        history.push("/");
      }}
    />
  );

  const renderRightControl = () => (
    <View style={{ padding: 12 }}>
      <Link to="/start">Sumá tu comercio!</Link>
    </View>
  );

  return (
    <TopNavigation
      style={{ backgroundColor: theme["color-primary-default"] }}
      leftControl={renderLeftControl()}
      rightControls={renderRightControl()}
    />
  );
}
