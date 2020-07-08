import React from "react";
import {useSelector} from "react-redux";
import {StyleSheet, Text, TouchableHighlight, View} from "react-native";
import {useHistory} from "react-router-dom";

import colors from "assets/colors";
import {ArrowLeft as ArrowLeftIcon} from "assets/icons";

export default () => {
  const {slug} = useSelector((state) => state.shop.shop);
  const history = useHistory();

  return (
    <View style={styles.container}>
      <View style={styles.containerNavigator}>
        <TouchableHighlight
          onPress={() => history.push(`/${slug}`)}
          underlayColor="none"
          style={styles.buttonBack}
        >
          <ArrowLeftIcon />
        </TouchableHighlight>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Revisar mi Pedido</Text>
      </View>
    </View>
  );
};

const barlow = {fontFamily: "Barlow"};
const xlargeText = 19;

const textStyles = {
  xlargeText: {
    ...barlow,
    fontSize: xlargeText,
    fontWeight: "600",
    lineHeight: 23,
  },
};

const styles = StyleSheet.create({
  buttonBack: {
    left: 0,
    padding: 24,
    position: "absolute",
    top: 0,
  },
  container: {

  },
  containerNavigator: {
    color: colors.brown,
    flexDirection: "row",
    zIndex: 2
  },
  title: {
    ...textStyles.xlargeText,
    color: colors.brown,
  },
  titleContainer: {
    alignItems: "center",
    borderBottomColor: colors.gray1,
    borderBottomWidth: 2,
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 23,
    paddingTop: 21,
  },
});
