import React from "react";
import {StyleSheet, View, Text} from "react-native";

import theme from "../../assets/theme";

const ShopNotes = ({shop}) => {
  if (shop.notes) {
    return (
      <View style={styles.container}>
        <Text style={styles.category}>Notas</Text>
        <Text style={styles.notes}>{shop.notes}</Text>
      </View>
    );
  }

  return null;
};

export default ShopNotes;

const styles = StyleSheet.create({
  category: {
    color: theme.colors.brown,
    fontFamily: "Barlow",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 2,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
  },
  container: {
    flex: 1,
    marginBottom: 40

  },
  notes: {
    color: theme.colors.lightGrey,
    fontFamily: "Roboto Slab",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    marginBottom: 2,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
  },
});
