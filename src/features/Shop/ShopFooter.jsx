import React from "react";
import {useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {StyleSheet, TouchableHighlight, View, Text} from "react-native";
import {generateCallUrl} from "utils/utils";
import * as Icons from "assets/icons/";
import colors from "assets/colors";

export default ({shop}) => {
  const {ordersphonenumber, orderswhatsappnumber} = shop;
  const history = useHistory();
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const statusOpacity = totalAmount ? {opacity: 1} : {opacity: 0.7}

  return (
    <View style={styles.container}>
      {orderswhatsappnumber && (
        <TouchableHighlight
          disabled={!totalAmount}
          underlayColor={"none"}
          onPress={() => history.push("/cart")}
          style={{flex: 1}}
        >

          <View style={[styles.buttonWhatsApp, styles.button, statusOpacity]}>
            <Text style={styles.buttonText}> Revisar mi pedido </Text>
            <View style={styles.totalAmountContainer}>
              <Text style={styles.totalAmountText}> {totalAmount} </Text>
            </View>
          </View>

        </TouchableHighlight>
      )}

      {ordersphonenumber && !orderswhatsappnumber && (
        // TODO: Extract component, to be reused in header
        <TouchableHighlight style={{flex: 1}} underlayColor={"none"}>
          <a
            href={generateCallUrl(ordersphonenumber)}
            style={{textDecoration: "none"}}
          >
            <View style={[styles.buttonCall, styles.button]}>
              <Icons.PhoneCall color={colors.white} />
              <Text style={styles.buttonText}>Llamar</Text>
            </View>
          </a>
        </TouchableHighlight>
      )}
    </View>
  );
};

const anotherOrange = "#E5A02F"

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    height: 50,
    justifyContent: "center",
    marginHorizontal: 18,
    marginTop: 12,
  },
  buttonCall: {
    backgroundColor: colors.orangeHP,
    borderColor: anotherOrange,
  },
  buttonText: {
    color: colors.white,
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  buttonWhatsApp: {
    backgroundColor: colors.addShopButtonBg,
    borderColor: colors.addShopButtonBorder,
  },
  container: {
    backgroundColor: colors.lightBackground,
    bottom: 0,
    flex: 1,
    flexDirection: "row",
    height: 100,
    position: "fixed",
    width: "100%",
  },
  totalAmountContainer: {
    alignItems: "center",
    borderColor: colors.white,
    borderRadius: "50%",
    borderWidth: 1.5,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    top: 13,
    width: 24,
  },
  totalAmountText: {
    color: colors.white,
    fontFamily: "Barlow",
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 1,
  },
});
