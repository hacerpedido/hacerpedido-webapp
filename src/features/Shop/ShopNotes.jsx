import React from "react";
import {useSelector} from "react-redux";
import {StyleSheet, View, Text} from "react-native";

export default () => {
  const {notes} = useSelector((state) => state.shop.shop);

  if (notes) {
    return (
      <View style={styles.container}>
        <Text style={styles.category}>Notas</Text>
        <Text style={styles.notes}>{notes}</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  category: {
    color: "#4D360F",
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
  },
  notes: {
    color: "#666666",
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
