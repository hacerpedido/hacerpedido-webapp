import React from "react";
import { View, Text } from "react-native";
import styles from "./ShopNotes.module.css";

const ShopNotes = ({ shop }) => {
  if (shop.notes) {
    return (
      <View className={styles.container}>
        <Text className={styles.category}>Notas</Text>
        <Text className={styles.notes}>{shop.notes}</Text>
      </View>
    );
  }

  return null;
};

export default ShopNotes;
