import React from "react";
import { View, Text } from "react-native";
import styles from "./ShopNotes.module.css";

const ShopNotes = ({ shop }) => {
  if (shop.notes) {
    return (
      <View classList={[styles.container]}>
        <Text classList={[styles.category]}>Notas</Text>
        <Text classList={[styles.notes]}>{shop.notes}</Text>
      </View>
    );
  }

  return null;
};

export default ShopNotes;
