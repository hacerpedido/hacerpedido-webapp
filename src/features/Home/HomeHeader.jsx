import React from "react";

import {StyleSheet, Text, View} from "react-native";
import {Link} from "react-router-dom";
import * as Icons from "assets/icons/";
import colors from "assets/colors";

export default () => {
  return (
    <View style={styles.container}>
      <Link to="/">
        <Icons.LogoHacerpedido width={177} height={19} color={colors.white} />
      </Link>

      { /* eslint-disable react-native/no-raw-text, react-native/no-inline-styles */}
      <a
        href="https://comercios.hacerpedido.com/"
        style={{textDecoration: "none"}}
      >
        <Text style={styles.addShopButton}>¡Sumá tu comercio!</Text>
      </a>
      { /* eslint-enable react-native/no-raw-text, react-native/no-inline-styles */}
    </View>
  );
};

const styles = StyleSheet.create({
  addShopButton: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.button1,
    borderRadius: 3,
    borderWidth: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
    padding: 7,
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.orangeHP,
    borderBottomWidth: 1,
    borderColor: colors.filterButtonBorder,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
});
