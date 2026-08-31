import React from "react";
import { Image, Text, TouchableHighlight, View } from "react-native";

import { useRouter } from "next/router";
import { generateCallUrl } from "../../lib/utils/utils";
import { getBackgroundColorForCategory } from "../../lib/utils/categoriesHelper";
import { getLogoForShop, getBackgroundForShop } from "../../lib/utils/shops";
import colors from "../../assets/colors";
import * as Icons from "../../assets/icons";
import DecoratedLabel from "../DecoratedLabel";
import styles from "./ShopHeader.module.css";

const ShopHeader = ({ isPreview = false, shop = {} }) => {
  const { name, background, category, address, region, ordersphonenumber, orderswhatsappnumber } = shop;

  const logo = getLogoForShop(shop);

  const router = useRouter();

  const containerStyles = {
    backgroundImage: getBackgroundForShop(shop),
    backgroundSize: background ? "100% auto" : "auto",
    backgroundColor: getBackgroundColorForCategory(category),
  };

  const onButtonBackPress = () => {
    !isPreview && router.push("/");
  };

  const showButtonCall = ordersphonenumber && orderswhatsappnumber && !isPreview;

  const ButtonCall = () => (
    <TouchableHighlight underlayColor={"none"}>
      {/* eslint-disable react-native/no-inline-styles */}
      <a href={generateCallUrl(ordersphonenumber)} style={{ textDecoration: "none" }}>
        <View style={styles.buttonCall}>
          <Icons.PhoneCall />
          <Text style={styles.buttonText}>Llamar</Text>
        </View>
      </a>
      {/* eslint-enable react-native/no-inline-styles */}
    </TouchableHighlight>
  );

  const displayAddress = address?.trim() ?? region;
  const opentimes = shop?.opentimes?.trim() !== "" ? shop.opentimes : null;
  const deliverycost = shop?.deliverycost?.trim() !== "" ? shop.deliverycost : null;

  return (
    <View style={containerStyles}>
      <View classList={[styles.containerNavigator]}>
        {!isPreview && (
          <TouchableHighlight underlayColor={"none"} onPress={onButtonBackPress} classList={[styles.buttonBack]}>
            <Icons.ArrowLeft color={colors.white} />
          </TouchableHighlight>
        )}

        {showButtonCall && (
          <View classList={[styles.buttonCallContainer]}>
            <ButtonCall />
          </View>
        )}
      </View>

      <View classList={[styles.containerData]}>
        <View classList={[styles.containerLogo]}>
          <Image source={{ uri: logo }} classList={[styles.logo]} />
        </View>
        <Text classList={[styles.shopName]}>{name?.toLowerCase()}</Text>
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

export default ShopHeader;
