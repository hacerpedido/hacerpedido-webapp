import React from "react";
import { View, Image, Text } from "react-native";
import { getLogoForShop } from "../../lib/utils/shops";

import DecoratedLabel from "../DecoratedLabel";
import colors from "../../assets/colors";
import styles from "./ShopCard.module.css";

const ShopCard = ({ shop }) => {
  const { name, address, opentimes, deliverycost } = shop;
  const logo = getLogoForShop(shop);

  return (
    <View classList={[styles.card]}>
      <View classList={[styles.container]}>
        <View classList={[styles.containerLogo]}>
          <Image source={{ uri: logo }} classList={[styles.logo]} />
        </View>
        <View classList={[styles.containerLabels]}>
          <Text classList={[styles.shopName]}>{name.toLowerCase()}</Text>
          {address && (
            <DecoratedLabel iconName="pin" text={address} iconColor={iconColor} textColor={colors.lightGrey} />
          )}
          {opentimes && (
            <DecoratedLabel iconName="clock" text={opentimes} iconColor={iconColor} textColor={colors.lightGrey} />
          )}
          {/* El siguiente Text tag está agregado para evitar errores en la consola: A text node cannot be a child of a <View> */}
          <Text>
            {deliverycost && (
              <DecoratedLabel iconName="car" text={deliverycost} iconColor={iconColor} textColor={colors.lightGrey} />
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ShopCard;

const iconColor = "#C5CEE0";
