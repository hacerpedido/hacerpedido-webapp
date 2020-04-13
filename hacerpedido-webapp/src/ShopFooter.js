import React from "react";
import { StyleSheet, TouchableHighlight, View, Text } from "react-native";
import * as Icons from "./assets/icons/";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 5
  },
  buttonWhatsApp: {
    backgroundColor: "#3ECB7D",
    borderColor: "#37B36E",
    marginVertical: 10,
  },
  buttonCall: {
    backgroundColor: "#ffb234",
    borderColor: "#E5A02F",
    marginVertical: 10,
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
    marginHorizontal: 5
  },
});

export default function ShopFooter({ shop }) {
  let callUrl;
  if (shop.ordersPhoneNumber) {
    callUrl = "tel:" + encodeURIComponent(shop.ordersPhoneNumber);
  } 

  let whatsappUrl;

  if (shop.ordersWhatsAppNumber) {
    let number = shop.ordersWhatsAppNumber.replace("+", "");

    whatsappUrl =
      "https://wa.me/" +
      number +
      // "&text=Hola!%20Quiero%20hacer%20un%20pedido.%20Enviado%20a%20trav%C3%A9s%20de%20*HacerPedido.com*";
      "?text=%C2%A1Hola%21%20Quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA";
  }

  return (
    <View style={styles.container}>
      {shop.ordersWhatsAppNumber ? (
        <TouchableHighlight
          underlayColor={"none"}
          style={{flex: (shop.ordersPhoneNumber ? 0.67 : 1)}}
        >
          <div className="bounza">
            <a href={whatsappUrl} style={{ textDecoration: "none" }}>
              <View style={[styles.buttonWhatsApp, styles.button]}>
                <Icons.WhatsappFill color={"white"} />
                <Text style={styles.buttonText}>Pedir por WhatsApp</Text>
              </View>
            </a>
          </div>
        </TouchableHighlight>
      ) : null}

      {shop.ordersPhoneNumber ? (
        <TouchableHighlight style={{flex: (shop.ordersWhatsAppNumber ? 0.33 : 1)}} underlayColor={"none"}>
          <a href={callUrl} style={{ textDecoration: "none" }}>
            <View style={[styles.buttonCall, styles.button]}>
              <Icons.PhoneCall color={"white"} />
              <Text style={styles.buttonText}>Llamar</Text>
            </View>
          </a>
        </TouchableHighlight>
      ) : null}
    </View>
  );
}
