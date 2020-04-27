import React from "react";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  divider: {
    borderColor: "#edf1f7",
    backgroundColor: "#fafafa",
    height: 10,
    width: "100%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 16,
    marginBottom: 16,
  },
});

export default () => {
  return <View style={styles.divider} />;
};
