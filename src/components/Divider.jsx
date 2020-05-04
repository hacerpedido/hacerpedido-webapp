import React from "react";
import { StyleSheet, View } from "react-native";

export default () => {
  return <View style={styles.divider} />;
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderColor: "#edf1f7",
    borderTopWidth: 1,
    height: 10,
    marginBottom: 16,
    marginTop: 16,
    width: "100%",
  },
});
