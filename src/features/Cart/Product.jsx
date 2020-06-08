import React from "react";
import {StyleSheet, Text, View} from "react-native";
import colors from "assets/colors";

export default ({product}) => {
  const {amount, description, name} = product;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        <Text style={styles.amount}>{amount}</Text>

        <View style={styles.nameDescription}>
          <Text style={styles.text}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </Text>
    </View>
  );
};

const normalText = {
  fontFamily: "Barlow",
  fontSize: 15,
}

const textStyles = {
  normalBoldText: {
    ...normalText,
    fontWeight: "bold",
  },
  normalSemiBoldText: {
    ...normalText,
    fontWeight: 500,
  },
};

const styles = StyleSheet.create({
  amount: {
    ...textStyles.normalBoldText,
    marginRight: 9,
  },
  container: {
    marginBottom: 9,
    marginHorizontal: 24,
  },
  description: {
    color: colors.lightGrey,
    fontSize: 13,
    fotiFamily: "Roboto Slab",
    lineHeight: 17,
  },
  nameDescription: {
  },
  text: {
    ...textStyles.normalSemiBoldText,
    color: colors.darkBrown,
  },
});
