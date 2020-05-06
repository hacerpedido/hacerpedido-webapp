import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

export default () => {
  return (
    <ActivityIndicator size="large" color="#FFB233" style={styles.default} />
  );
};

const styles = StyleSheet.create({
  default: {
    margin: 30,
  },
});
