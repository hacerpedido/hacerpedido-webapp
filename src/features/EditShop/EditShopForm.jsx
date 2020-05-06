import React from "react";
import { StyleSheet, Text, View } from "react-native";

import colors from "../../assets/colors";

export default ({ shop, products, isPreview }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Datos de tu Comercio</Text>
      <View style={styles.formContainer}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightBackground,
    flex: 1,
  },
  formContainer: {
    backgroundColor: colors.white,
    flex: 1,
  },
  title: {
    color: colors.black,
    fontFamily: "Barlow",
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: 500,
    lineHeight: 29,
    marginVertical: 10,
  },
});
