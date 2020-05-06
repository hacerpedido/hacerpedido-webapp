import React from "react";
import { View, Image, StyleSheet, Text } from "react-native";

import DecoratedLabel from "../../components/DecoratedLabel";
import colors from "../../assets/colors";

export default ({ shop, selected, onSelect }) => {
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
          {shop.opentimes ? (
            <DecoratedLabel
              iconName="clock"
              text={shop.opentimes}
              iconColor={"#C5CEE0"}
              textColor={"#8F9BB3"}
            />
          ) : null}
          {shop.deliverycost ? (
            <DecoratedLabel
              iconName="car"
              text={shop.deliverycost}
              iconColor={"#C5CEE0"}
              textColor={"#8F9BB3"}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: 7,
    borderWidth: 1,
    marginBottom: 6,
    paddingBottom: 20,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 20,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  containerLabels: {
    flex: 1,
    marginLeft: 8,
    paddingLeft: 8,
  },
  containerLogo: {
    alignItems: "center",
    flex: -1,
    height: 75,
    width: 75,
  },
  logo: {
    backgroundColor: colors.lightBackground,
    borderRadius: 37.5,
    height: 75,
    width: 75,
  },
  shopName: {
    color: colors.darkGray,
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "capitalize",
  },
});
