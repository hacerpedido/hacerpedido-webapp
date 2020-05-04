import React from "react";

import { StyleSheet, Text, View } from "react-native";
import { Link } from "react-router-dom";
import * as Icons from "../../assets/icons/";

export default () => {
  return (
    <View style={styles.container}>
      <Link to="/">
        <Icons.LogoHacerpedido width={177} height={19} color={"white"} />
      </Link>

      <a
        href="https://comercios.hacerpedido.com/"
        style={{ textDecoration: "none" }}
      >
        <Text style={styles.addShopButton}>¡Sumá tu comercio!</Text>
      </a>
    </View>
  );
};

const styles = StyleSheet.create({
  addShopButton: {
    backgroundColor: "#3ECB7D",
    borderColor: "#37B26E",
    borderRadius: 3,
    borderWidth: 1,
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    padding: 7,
  },
  button: {
    borderRadius: 3,
  },
  container: {
    alignItems: "center",
    backgroundColor: "#FFB233",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
});
