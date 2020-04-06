import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Button, Icon, Layout, Text } from "@ui-kitten/components";
import { useHistory } from "react-router-dom";
import Background from "./assets/images/fondo1.png";

import DecoratedLabel from "./components/DecoratedLabel";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  containerLogo: {
    flex: -1,
    width: 100,
    height: 100,
    alignItems: "center"
  },
  containerLabels: {
    flex: 1,
    paddingStart: 8
  },
  containerBottom: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    flex: 1,
    backgroundColor: "none",
    padding: 12,
    paddingTop: 18
  },
  containerDelivery: {
    justifyContent: "flex-end",
    backgroundColor: "none"
  },
  decoratedLabel: {
    textAlignVertical: "center",
    color: "#222b45",
    paddingBottom: 6
  },
  shopName: {
    color: "#fff",
    padding: 6,
    fontFamily: "Barlow",
    fontWeight: "700"
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  containerTop: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "none"
  },
  buttonBack: { backgroundColor: "none", border: 0 }
});

export default function ShopHeader({ shop }) {
  const history = useHistory();

  const BackIcon = style => (
    <Icon {...style} name="arrow-back" width={24} height={24} />
  );

  return (
    <View
      style={{
        marginBottom: 16,
        background:
          "linear-gradient(180deg, rgba(0, 0, 0, 0.1) 31.44%, rgba(0, 0, 0, 0.6) 100%), " +
          `url(${Background})` +
          ", #3ECC7E",
        // backgroundRepeat: "tile",
        backgroundSize: "418px 280px"
      }}
    >
      <Layout style={styles.containerTop}>
        <Button
          style={styles.buttonBack}
          onPress={() => {
            history.push("/");
          }}
          icon={BackIcon}
        ></Button>
      </Layout>
      <View style={styles.container}>
        <View style={styles.containerLogo}>
          <Image
            source={{
              uri: shop.logo
            }}
            style={styles.logo}
          />
        </View>
        <Text category="h4" style={styles.shopName}>
          {shop.name}
        </Text>
        {shop.address ? (
          <DecoratedLabel iconName="pin" text={shop.address} color={"#fff"} />
        ) : null}
      </View>
      <Layout style={styles.containerBottom}>
        {shop.openTimes ? (
          <DecoratedLabel
            iconName="clock"
            text={"Pedidos: " + shop.openTimes}
            color={"#fff"}
          />
        ) : null}
        <Layout style={styles.containerDelivery}>
          {shop.deliveryCost ? (
            <DecoratedLabel
              iconName="car"
              text={"Delivery: " + shop.deliveryCost}
              color={"#fff"}
            />
          ) : null}
        </Layout>
      </Layout>
    </View>
  );
}
