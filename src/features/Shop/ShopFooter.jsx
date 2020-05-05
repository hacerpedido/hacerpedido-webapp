import React from "react";
import { StyleSheet, TouchableHighlight, View, Text } from "react-native";

import * as Icons from "../../assets/icons/";
import { sanitizeWhatsAppNumber } from "../../utils";

export default ({ shop }) => {
  let callUrl;
  if (shop.ordersphonenumber) {
    callUrl = "tel:" + encodeURIComponent(shop.ordersphonenumber);
  }

  let whatsappUrl;

  if (shop.orderswhatsappnumber) {
    let number = sanitizeWhatsAppNumber(shop.orderswhatsappnumber);

    // TODO: Extraer y encapsular pensando en el carrito de compras
    whatsappUrl =
      "https://wa.me/" +
      number +
      "?text=%C2%A1Hola%21%20Quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA";
  }

  return (
    <View style={styles.container}>
      {shop.orderswhatsappnumber && (
        <TouchableHighlight
          underlayColor={"none"}
          style={{ flex: shop.ordersphonenumber ? 0.67 : 1 }}
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
      )}

      {shop.ordersphonenumber && (
        <TouchableHighlight
          style={{ flex: shop.orderswhatsappnumber ? 0.33 : 1 }}
          underlayColor={"none"}
        >
          <a href={callUrl} style={{ textDecoration: "none" }}>
            <View style={[styles.buttonCall, styles.button]}>
              <Icons.PhoneCall color={"white"} />
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
    backgroundColor: "#ffb234",
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
