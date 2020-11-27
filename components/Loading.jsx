import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import colors from "../assets/colors";

export default function Loading() {
  return <ActivityIndicator size="large" color={colors.orangeHP} style={styles.default} />;
}

const styles = StyleSheet.create({
  default: {
    margin: 30,
  },
});
