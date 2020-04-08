import React from "react";

import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { Link, useHistory } from "react-router-dom";
import * as Icons from "./assets/icons/";

export default function HomeHeader() {
  const history = useHistory();

  return (
    <View style={styles.container}>
      <Link to="/">
        <Icons.LogoHacerpedido width={177} height={19} color={"white"} />
      </Link>

      <TouchableHighlight
        onPress={() => {
          history.push("/start");
        }}
        style={styles.button}
      >
        <View>
          <Text style={styles.addShopButton}>¡Sumá tu comercio!</Text>
        </View>
      </TouchableHighlight>
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
    border: 1,
    borderColor: "#37B26E",
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
