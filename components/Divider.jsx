import React from "react";
import { StyleSheet, View } from "react-native";
import colors from "../assets/colors";

export default function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.lightBackground,
    borderBottomWidth: 1,
    borderColor: colors.dividerBorder,
    borderTopWidth: 1,
    height: 10,
    marginBottom: 16,
    marginTop: 16,
    width: "100%",
  },
});
