import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import theme from "assets/theme";

export default ({ message, onMessagePress }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onMessagePress();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onMessagePress]);

  return (
    <View style={styles.container}>
      <TouchableHighlight onPress={onMessagePress} style={styles.touchable}>
        <Text style={styles.text}>{message}</Text>
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    height: 100,
    justifyContent: "center",
    left: 0,
    opacity: 0.8,
    position: "absolute",
    right: 0,
    top: 0,
  },
  text: {
    color: theme.colors.white,
    fontSize: "2em"
  },
  touchable: {
    alignItems: "center",
    backgroundColor: theme.colors.black,

    height: 100,
    justifyContent: "center",
    left: 0,
    opacity: 0.9,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
