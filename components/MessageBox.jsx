import React, { useEffect } from "react";
import { Text, TouchableHighlight, View } from "react-native";
import styles from "./MessageBox.module.css";

const MessageBox = ({ message, onMessagePress }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onMessagePress();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onMessagePress]);

  return (
    <View classList={[styles.container]}>
      <TouchableHighlight onPress={onMessagePress} classList={[styles.touchable]}>
        <>
          <Text classList={[styles.text]}>{message}</Text>
          <Text classList={[styles.textClose]}>x</Text>
        </>
      </TouchableHighlight>
    </View>
  );
};

export default MessageBox;
