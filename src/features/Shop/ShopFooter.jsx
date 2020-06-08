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
  const cartProducts =
    useSelector((state) => state.cart.products);
  const statusOpacity = cartProducts.length || {opacity: 0.3}

  return (
    <View style={styles.container}>
      {orderswhatsappnumber && (
        <TouchableHighlight
          disabled={cartProducts.length === 0}
          underlayColor={"none"}
          onPress={() => history.push("/cart")}
          style={{flex: 1}}
        >
          <View style={[styles.buttonWhatsApp, styles.button, statusOpacity]}>
            <Icons.WhatsappFill color={"white"} />
            <Text style={styles.buttonText}>
              {`Revisar mi pedido (${cartProducts.length})`}
            </Text>
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


const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 5,
    marginTop: 12,
    minHeight: 50,
    padding: 10,
  },
  buttonCall: {
    backgroundColor: colors.orangeHP,
    borderColor: "#E5A02F",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  buttonWhatsApp: {
    backgroundColor: "#3ECB7D",
    borderColor: "#37B36E",
    marginVertical: 10,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 5,
  },
});
