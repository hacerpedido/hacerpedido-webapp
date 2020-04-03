import React from "react";
import { View } from "react-native";
import { withStyles } from "@ui-kitten/components";
import { Link } from "react-router-dom";

const HeaderView = props => {
  const { themedStyle, style, ...restProps } = props;

  return (
    <View {...restProps} style={[themedStyle, style]}>
      <Link to="/">Home</Link>
      <Link to="/start">Start</Link>
    </View>
  );
};

export const ThemedHeaderView = withStyles(HeaderView, theme => ({
  // awesome: {
    backgroundColor: theme["color-primary-500"]
  // }
}));

export default function Header() {
  return <ThemedHeaderView />;
}
