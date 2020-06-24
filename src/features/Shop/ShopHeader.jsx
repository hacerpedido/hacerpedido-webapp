import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { useHistory } from "react-router-dom";

import {
  getBackgroundForCategory,
  getBackgroundColorForCategory,
} from "utils/categoriesHelper";
import colors from "assets/colors";
import * as Icons from "assets/icons/";
import DecoratedLabel from "components/DecoratedLabel";

function getBackgroundForShop({ background, category }) {
  if (background) return `url(${background})`;

  return getBackgroundForCategory(category);
}

export default ({ isPreview = false, shop = {} }) => {
  const { name, background, category, address, region } = shop;
  const history = useHistory();

  const containerStyles = {
    ...styles.container,
    background: getBackgroundForShop(shop),
    backgroundSize: background ? "100% auto" : "auto",
    backgroundColor: getBackgroundColorForCategory(category),
  };

  const onButtonBackPress = () => {
    !isPreview && history.push("/");
  };

  const displayAddress = address.trim() ?? region;
  const opentimes = shop?.opentimes.trim() !== "" ? shop.opentimes : null;
  const deliverycost =
    shop?.deliverycost.trim() !== "" ? shop.deliverycost : null;

  return (
    <View style={containerStyles}>
      <View style={styles.containerNavigator}>
        {!isPreview && (
          <TouchableHighlight
            underlayColor={"none"}
            onPress={onButtonBackPress}
            style={styles.buttonBack}
          >
            <Icons.ArrowLeft color={colors.white} />
          </TouchableHighlight>
        )}
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
        <Text style={styles.shopName}>{name?.toLowerCase()}</Text>
        {displayAddress && (
          <DecoratedLabel
            iconName="pin"
            text={displayAddress}
            iconColor={colors.white}
            textColor={colors.white}
            fontSize={13}
            marginBottom={4}
          />
        )}
        {opentimes && (
          <DecoratedLabel
            iconName="clock"
            text={opentimes}
            iconColor={colors.white}
            textColor={colors.white}
            fontSize={13}
            marginBottom={4}
          />
        )}
        {deliverycost && (
          <DecoratedLabel
            iconName="car"
            text={"Delivery: " + deliverycost}
            iconColor={colors.white}
            textColor={colors.white}
            fontSize={13}
            marginBottom={4}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonBack: {
    backgroundColor: colors.none,
    border: 0,
    padding: 16,
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
    marginBottom: 26,
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
    minHeight: "4em",
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
