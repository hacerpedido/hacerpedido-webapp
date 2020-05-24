import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import {useHistory} from "react-router-dom";

import colors from "assets/colors";
import * as Icons from "assets/icons/";
import {
  getBackgroundForCategory,
  getBackgroundColorForCategory,
} from "categoriesHelper";
import {generateCallUrl} from "utils";
import DecoratedLabel from "components/DecoratedLabel";

function getBackgroundForShop({background, category}) {
  if (background) return `url(${background})`;

  return getBackgroundForCategory(category);
}

export default ({shop, isPreview}) => {
  const {ordersphonenumber, background, category} = shop;
  const history = useHistory();
  const address = shop.address ?? shop.region;

  const containerStyles = {
    ...styles.container,
    background: getBackgroundForShop(shop),
    backgroundSize: background ? "100% auto" : "auto",
    backgroundColor: getBackgroundColorForCategory(category),
  };

  const onButtonBackPress = () => {
    !isPreview && history.push("/");
  };

  return (
    <View style={containerStyles}>
      <View style={styles.containerNavigator}>
        <TouchableHighlight
          underlayColor={"none"}
          onPress={onButtonBackPress}
          style={styles.buttonBack}
        >
          <Icons.ArrowLeft color={colors.white} />
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
          iconColor={colors.white}
          textColor={colors.white}
          fontSize={13}
          marginBottom={4}
        />
        {shop.opentimes && (
          <DecoratedLabel
            iconName="clock"
            text={shop.opentimes}
            iconColor={colors.white}
            textColor={colors.white}
            fontSize={13}
            marginBottom={4}
          />
        )}
        {shop.deliverycost && (
          <DecoratedLabel
            iconName="car"
            text={"Delivery: " + shop.deliverycost}
            iconColor={colors.white}
            textColor={colors.white}
            fontSize={13}
            marginBottom={30}
          />
        )}
      </View>
    </View>
  );
};

const anotherOrange = "#E5A02F";

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 5,
    marginTop: 12,
    minHeight: 50,
    padding: 10,
  },
  buttonBack: {
    backgroundColor: colors.none,
    border: 0,
    padding: 16,
  },
  buttonCall: {
    backgroundColor: colors.none,
    borderColor: anotherOrange,
    marginVertical: 10,
  },
  buttonText: {
    color: colors.white,
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  container: {
    marginBottom: 16,
  },
  containerData: {
    alignItems: "center",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    marginTop: -24,
    zIndex: 0,
  },
  containerLogo: {
    alignItems: "center",
    flex: -1,
    height: 100,
    width: 100,
  },
  containerNavigator: {
    backgroundColor: colors.none,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  logo: {
    backgroundColor: colors.white,
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  shopName: {
    color: colors.white,
    fontFamily: "Barlow",
    fontSize: 19,
    fontWeight: "700",
    marginVertical: 5,
    padding: 6,
    textTransform: "capitalize",
  },
});
