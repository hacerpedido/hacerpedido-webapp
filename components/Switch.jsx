import React from "react";
import { StyleSheet, View, Switch, Text } from "react-native";
import colors from "../assets/colors";

const SwitchComponent = ({ toggle, value }) => {
  return (
    <View style={styles.container}>
      <Text>Delivery</Text>

      <Switch
        trackColor={colors.lightGray}
        thumbColor={colors.lightGray}
        activeTrackColor={colors.lightGreen}
        activeThumbColor={colors.lightGreen}
        onValueChange={toggle}
        style={styles.switch}
        value={value}
      />

      <Text>Takeaway</Text>
    </View>
  );
};

// https://upmostly.com/tutorials/build-a-react-switch-toggle-component
export default SwitchComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  switch: {
    marginHorizontal: 7,
  },
});
