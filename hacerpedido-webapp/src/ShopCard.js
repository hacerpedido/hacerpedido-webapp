import React from "react";
import { useHistory } from "react-router-dom";
import { View, Image, StyleSheet } from "react-native";
import { Card, Icon, Text } from "@ui-kitten/components";

const styles = StyleSheet.create({
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
    paddingStart: 8
  },
  dataLabels: {
    textAlignVertical: "center",
    color: "#8f9bb3",
    paddingStart: 6
  },
  logo: {
    width: 75,
    height: 75
  }
});

function DecoratedLabel({ iconName, text }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center"
      }}
    >
      <Icon name={iconName} width={14} height={14} />
      <Text style={styles.dataLabels}>{text}</Text>
    </View>
  );
}

export default function ShopCard({ shop }) {
  const history = useHistory();

  return (
    <Card
      onPress={() => {
        history.push("/" + shop.slug);
      }}
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
          <Text category="h6" style={{ color: "#222b45" }}>
            {shop.name}
          </Text>
          {shop.address ? (
            <DecoratedLabel iconName="pin" text={shop.address} />
          ) : null}
          {shop.openTimes ? (
            <DecoratedLabel
              iconName="clock"
              text={"Pedidos: " + shop.openTimes}
            />
          ) : null}
          {shop.deliveryCost ? (
            <DecoratedLabel
              iconName="car"
              text={"Delivery: " + shop.deliveryCost}
            />
          ) : null}
        </View>
      </View>
    </Card>
  );
}
