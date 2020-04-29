import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { useHistory } from "react-router-dom";

import * as Icons from "../../assets/icons/";
import {
  getBackgroundForCategory,
  getBackgroundColorForCategory,
} from "../../categoriesHelper";
import DecoratedLabel from "../../components/DecoratedLabel";
function getBackgroundForShop(shop) {
  if (shop.background) {
    return `url(${shop.background})`;
  }

  return getBackgroundForCategory(shop.category);
}

export default ({ shop }) => {
  const history = useHistory();

  const address = shop.address ?? shop.region;

  return (
    <View
      style={{
        ...styles.container,
        background: getBackgroundForShop(shop),
        backgroundSize: shop.background ? "100% auto" : "auto",
        backgroundColor: getBackgroundColorForCategory(shop.category),
      }}
    >
      <View style={styles.containerNavigator}>
        <TouchableHighlight
          underlayColor={"none"}
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
        <Text style={styles.shopName}>{shop.name.toLowerCase()}</Text>
        <DecoratedLabel
          iconName="pin"
          text={address}
          iconColor={"#fff"}
          textColor={"#fff"}
          fontSize={13}
          marginBottom={4}
        />
        {shop.openTimes && (
          <DecoratedLabel
            iconName="clock"
            text={shop.openTimes}
            iconColor={"#fff"}
            textColor={"#fff"}
            fontSize={13}
            marginBottom={4}
          />
        )}
        {shop.deliveryCost && (
          <DecoratedLabel
            iconName="car"
            text={"Delivery: " + shop.deliveryCost}
            iconColor={"#fff"}
            textColor={"#fff"}
            fontSize={13}
            marginBottom={30}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  containerNavigator: {
    zIndex: 2,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "none",
  },
  containerData: {
    zIndex: 0,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
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
    marginVertical: 5,
    textTransform: "capitalize",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
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
