import React from "react";
import { StyleSheet, TouchableHighlight, View, Text } from "react-native";
import * as Icons from "./assets/icons/";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  containerWhatsApp: {
    flex: 0.67,
  },
  containerCall: {
    flex: 0.33,
  },
  buttonWhatsApp: {
    backgroundColor: "#3ECB7D",
    borderColor: "#37B36E",
    margin: 10,
  },
  buttonCall: {
    backgroundColor: "#ffb234",
    borderColor: "#E5A02F",
    marginRight: 10,
  },
  buttonText: {
    fontFamily: "Barlow",
    fontWeight: "600",
    fontSize: 16,
    color: "#fff",
    marginLeft: 5,
  },
  button: {
    minHeight: 50,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
  },
});

export default function ShopFooter({ shop }) {
  const onPressWhatsApp = () => {
    let url =
      "https://api.whatsapp.com/send?phone=" +
      shop.ordersWhatsAppNumber +
      "&amp;text=Hola!%20Quiero%20hacer%20un%20pedido.%20Enviado%20a%20trav%C3%A9s%20de%20*HacerPedido.com*";

    window.location.href = url;
  };

  const onPressCall = () => {
    window.location.href = "tel:" + shop.ordersPhoneNumber;
  };

  return (
    <View style={styles.container}>
      {shop.ordersWhatsAppNumber ? (
        <TouchableHighlight
          underlayColor={"none"}
          onPress={onPressWhatsApp}
          style={styles.containerWhatsApp}
        >
          <View style={[styles.buttonWhatsApp, styles.button]}>
            <Icons.WhatsappFill color={"white"} />
            <Text style={styles.buttonText}>Pedir por Whatsapp</Text>
          </View>
        </TouchableHighlight>
      ) : null}

      {shop.ordersPhoneNumber ? (
        <TouchableHighlight
          onPress={onPressCall}
          style={styles.containerCall}
          underlayColor={"none"}
        >
          <View style={[styles.buttonCall, styles.button]}>
            <Icons.PhoneCall color={"white"} />
            <Text style={styles.buttonText}>Llamar</Text>
          </View>
        </TouchableHighlight>
      ) : null}
    </View>
  );
}
