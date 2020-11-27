import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

import theme from "../assets/theme";

const MessageBox = ({ message, onMessagePress }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onMessagePress();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onMessagePress]);

  return (
    <View style={styles.container}>
      <TouchableHighlight onPress={onMessagePress} style={styles.touchable}>
        <>
          <Text style={styles.text}>{message}</Text>
          <Text style={styles.textClose}>x</Text>
        </>
      </TouchableHighlight>
    </View>
  );
};

export default MessageBox;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.black,
    height: "5em",
    left: 0,
    opacity: 0.8,
    position: "absolute",
    right: 0,
    top: 0,
  },
  text: {
    alignSelf: "center",
    color: theme.colors.white,
    flex: 1,
    fontSize: "1.2em",
    textAlign: "center",
    textAlignVertical: "center",
  },
  textClose: {
    color: theme.colors.white,
    fontSize: "1.5em",
    textAlign: "center",
    width: 60,
  },
  touchable: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
