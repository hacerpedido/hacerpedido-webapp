import React from "react";
import { useHistory } from "react-router-dom";
import { View, Image, StyleSheet } from "react-native";
import { Card, Text } from "@ui-kitten/components";

import DecoratedLabel from "./components/DecoratedLabel";

const styles = StyleSheet.create({
  card: {
    marginBottom: 16
  },
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  containerLogo: {
    flex: -1,
    width: 75,
    height: 75,
    alignItems: "center"
  },
  containerLabels: {
    flex: 1,
    paddingStart: 8,
    marginLeft: 8
  },
  logo: {
    width: 75,
    height: 75
  }
});

export default function ShopCard({ shop }) {
  const history = useHistory();

  return (
    <Card
      onPress={() => {
        history.push("/" + shop.slug);
      }}
      style={styles.card}
    >
      <View style={styles.container}>
        <View style={styles.containerLogo}>
          <Image
            source={{
              uri: shop.logo
            }}
            style={styles.logo}
          />
        </View>
        <View style={styles.containerLabels}>
          <Text category="h6" style={{ color: "#222b45", marginBottom:4 }}>
            {shop.name}
          </Text>
          {shop.address ? (
            <DecoratedLabel
              iconName="pin"
              text={shop.address}
              color={"#8f9bb3"}
            />
          ) : null}
          {shop.openTimes ? (
            <DecoratedLabel
              iconName="clock"
              text={"Pedidos: " + shop.openTimes}
              color={"#8f9bb3"}
            />
          ) : null}
          {shop.deliveryCost ? (
            <DecoratedLabel
              iconName="car"
              text={"Delivery: " + shop.deliveryCost}
              color={"#8f9bb3"}
            />
          ) : null}
        </View>
      </View>
    </Card>
  );
}
