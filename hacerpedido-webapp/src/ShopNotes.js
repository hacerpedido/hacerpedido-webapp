import React from "react";
import { StyleSheet,  View, Text } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  category: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 2,
    fontFamily: "Barlow",
    fontWeight: "800",
    fontSize: 17,
    color: "#4D360F",
  },
  notes: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    marginBottom: 2,
    fontFamily: "Roboto Slab",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 16,
    color: "#666666"
  }
});

export default ({ shop }) => {
  if (shop.notes) {
    return (
      <View style={styles.container}>
        <Text style={styles.category}>Notas</Text>
        <Text style={styles.notes}>{shop.notes}</Text>
      </View>
    );
  }

  return null;
}
