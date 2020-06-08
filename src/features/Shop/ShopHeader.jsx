import React from "react";
import {Image, StyleSheet, Text, TouchableHighlight, View, } from "react-native";
import {useHistory} from "react-router-dom";
import {generateCallUrl} from "utils/utils"
import {getBackgroundForCategory, getBackgroundColorForCategory} from "utils/categoriesHelper";
import colors from "assets/colors";
import * as Icons from "assets/icons/";
import DecoratedLabel from "components/DecoratedLabel";

function getBackgroundForShop({background, category}) {
  if (background) return `url(${background})`;

  return getBackgroundForCategory(category);
}

export default ({isPreview = false, shop = {}}) => {
  const {name, background, category, address, region, ordersphonenumber} = shop;
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

  return (
    <View style={containerStyles}>
      <TouchableHighlight
        underlayColor={"none"}
        onPress={onButtonBackPress}
        style={styles.buttonBack}
      >
        <Icons.ArrowLeft />
      </TouchableHighlight>

      <View style={styles.buttonCallContainer}>
        {ordersphonenumber && (
          <TouchableHighlight underlayColor={"none"}>
            <a
              href={generateCallUrl(ordersphonenumber)}
              style={{textDecoration: "none"}}
            >
              <View style={styles.buttonCall}>
                <Icons.PhoneCall />
                <Text style={styles.buttonText}>Llamar</Text>
              </View>
            </a>
          </TouchableHighlight>
        )}
      </View>

      <View style={styles.containerData}>
        <View style={styles.containerLogo}>
          <Image source={{uri: shop.logo, }} style={styles.logo} />
        </View>
        <Text style={styles.shopName}>{name?.toLowerCase()}</Text>
        <DecoratedLabel
          iconName="pin"
          text={address ?? region}
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

const styles = StyleSheet.create({
  buttonBack: {
    color: colors.white,
    left: 24,
    position: "absolute",
    top: 24,
    zIndex: 2,
  },
  buttonCall: {
    borderColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    color: colors.white,
    flexDirection: "row",
    justifyContent: "center",
    opacity: 0.7,
    paddingHorizontal: 9,
    paddingTop: 8,
    zIndex: 2,
  },
  buttonCallContainer: {
    position: "absolute",
    right: 24,
    top: 16,
    zIndex: 1,
  },
  buttonText: {
    color: colors.white,
    fontFamily: "Barlow",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  container: {
    marginBottom: 16,
  },
  containerData: {
    alignItems: "center",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    zIndex: 0,
    marginTop: 40
  },
  containerLogo: {
    alignItems: "center",
    flex: -1,
    height: 100,
    width: 100,
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
