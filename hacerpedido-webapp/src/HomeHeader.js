import React from "react";

import { StyleSheet, Text, View } from "react-native";
import { Link } from "react-router-dom";
import * as Icons from "./assets/icons/";

export default function HomeHeader() {
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
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 3,
  },
  addShopButton: {
    fontWeight: "500",
    fontSize: 14,
    color: "#FFF",
    backgroundColor: "#3ECB7D",
    borderColor: "#37B26E",
    borderWidth: 1,
    borderRadius: 3,
    padding: 7,
  },
  container: {
    padding: 16,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFB233",
  },
});
