import React from "react";
import { View, Image, StyleSheet, Text } from "react-native";

import DecoratedLabel from "./components/DecoratedLabel";

const styles = StyleSheet.create({
  card: {
    marginBottom: 6,
    borderRadius: 7,
    borderColor: "#E8E8E8",
    borderWidth: 1,
    paddingBottom: 20,
    paddingTop: 20,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  containerLogo: {
    flex: -1,
    width: 75,
    height: 75,
    alignItems: "center",
  },
  containerLabels: {
    flex: 1,
    paddingLeft: 8,
    marginLeft: 8,
  },
  logo: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "#fff",
  },
  shopName: {
    color: "#4D360F",
    marginBottom: 4,
    fontFamily: "Barlow",
    fontWeight: "700",
    fontSize: 16,
    textTransform: "capitalize"
  },
});

export default function ShopCard({ shop, selected, onSelect }) {
  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <View style={styles.containerLogo}>
          <Image
            source={{
              uri: shop.logo,
            }}
            style={styles.logo}
          />
        </View>
        <View style={styles.containerLabels}>
          <Text style={styles.shopName}>{shop.name.toLowerCase()}</Text>
          {shop.address ? (
            <DecoratedLabel
              iconName="pin"
              text={shop.address}
              iconColor={"#C5CEE0"}
              textColor={"#8F9BB3"}
            />
          ) : null}
          {shop.openTimes ? (
            <DecoratedLabel
              iconName="clock"
              text={shop.openTimes}
              iconColor={"#C5CEE0"}
              textColor={"#8F9BB3"}
            />
          ) : null}
          {shop.deliveryCost ? (
            <DecoratedLabel
              iconName="car"
              text={shop.deliveryCost}
              iconColor={"#C5CEE0"}
              textColor={"#8F9BB3"}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}
