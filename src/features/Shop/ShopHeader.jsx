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
        {shop.opentimes && (
          <DecoratedLabel
            iconName="clock"
            text={shop.opentimes}
            iconColor={"#fff"}
            textColor={"#fff"}
            fontSize={13}
            marginBottom={4}
          />
        )}
        {shop.deliverycost && (
          <DecoratedLabel
            iconName="car"
            text={"Delivery: " + shop.deliverycost}
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
  buttonBack: {
    backgroundColor: "none",
    border: 0,
    left: 0,
    padding: 16,
    position: "absolute",
    top: 0,
  },
  container: {
    marginBottom: 16,
  },
  containerData: {
    alignItems: "center",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    marginTop: 16,
    zIndex: 0,
  },
  containerLabels: {
    flex: 1,
    paddingStart: 8,
  },
  containerLogo: {
    alignItems: "center",
    flex: -1,
    height: 100,
    width: 100,
  },
  containerNavigator: {
    backgroundColor: "none",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    zIndex: 2,
  },
  logo: {
    backgroundColor: "#fff",
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  shopName: {
    color: "#fff",
    fontFamily: "Barlow",
    fontSize: 19,
    fontWeight: "700",
    marginVertical: 5,
    padding: 6,
    textTransform: "capitalize",
  },
});
