import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { useHistory } from "react-router-dom";
import Background from "./assets/images/fondo2@1x.jpg";
import * as Icons from "./assets/icons/";

import DecoratedLabel from "./components/DecoratedLabel";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  containerData: {
    zIndex: 0,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16
  },
  containerLogo: {
    flex: -1,
    width: 100,
    height: 100,
    alignItems: "center",
  },
  containerLabels: {
    flex: 1,
    paddingStart: 8,
  },
  shopName: {
    color: "#fff",
    padding: 6,
    fontFamily: "Barlow",
    fontWeight: "700",
    fontSize: 19,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
  },
  containerTop: {
    zIndex: 2,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "none",
  },
  buttonBack: {
    backgroundColor: "none",
    border: 0,
    padding: 16,
    position: "absolute",
    top: 0,
    left: 0,
  },
});

export default function ShopHeader({ shop }) {
  const history = useHistory();

  return (
    <View
      style={{
        marginBottom: 16,
        background: `url(${Background}), #3ECC7E`,
      }}
    >
      <View style={styles.containerTop}>
        <TouchableHighlight
          onPress={() => {
            history.push("/");
          }}
          style={styles.buttonBack}
        >
            <Icons.ArrowLeft color={"white"} />
        </TouchableHighlight>
      </View>
      <View style={styles.containerData}>
        <View style={styles.containerLogo}>
          <Image
            source={{
              uri: shop.logo,
            }}
            style={styles.logo}
          />
        </View>
        <Text style={styles.shopName}>{shop.name}</Text>
        {shop.address ? (
          <DecoratedLabel
            iconName="pin"
            text={shop.address}
            iconColor={"#fff"}
            textColor={"#fff"}
            fontSize={13}
            marginBottom={5}
          />
        ) : null}
        {shop.openTimes ? (
          <DecoratedLabel
            iconName="clock"
            text={shop.openTimes}
            iconColor={"#fff"}
            textColor={"#fff"}
            fontSize={13}
            marginBottom={5}
          />
        ) : null}
        {shop.deliveryCost ? (
          <DecoratedLabel
            iconName="car"
            text={"Delivery: " + shop.deliveryCost}
            iconColor={"#fff"}
            textColor={"#fff"}
            fontSize={13}
            marginBottom={10}
          />
        ) : null}
      </View>
    </View>
  );
}
