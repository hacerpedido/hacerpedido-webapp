import React from "react";
import {StyleSheet, Text, View} from "react-native";
import colors from "assets/colors";

export default ({product}) => {
  const {amount, description, name} = product;

  return (
    <View style={styles.container}>
      <Text style={styles.amount}>{amount}</Text>

      <View style={styles.nameDescription}>
        <Text style={styles.text}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
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
    color: colors.brown,
    marginRight: 9,
  },
  container: {
    // alignItems: "center",
    flexDirection: "row",
    marginBottom: 9,
  },
  description: {
    color: colors.lightGrey,
    fontFamily: "Barlow",
    fontSize: 13,
    lineHeight: 17,
  },
  nameDescription: {
    color: colors.brown,
    flex: 1,
    ...textStyles.normalSemiBoldText,
  }
});
