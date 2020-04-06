import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Icon } from "@ui-kitten/components";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    padding: 18
  },
  buttonWhatsApp: {
    flex: 0.67,
    margin: 8,
    backgroundColor: "#3ECB7D",
    borderColor: "#37B36E",
    fontFamily: "Barlow",
    fontWeight: "600"
  },
  buttonCall: {
    flex: 0.33,
    margin: 8,
    backgroundColor: "#ffb234",
    borderColor: "#ffb234",
    fontFamily: "Barlow",
    fontWeight: "600"
  }
});

export default function ShopFooter({ shop }) {
  const WhatsAppIcon = style => <Icon {...style} name="whatsapp" />;
  const PhoneIcon = style => <Icon {...style} name="phone" />;

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
        <Button
          style={styles.buttonWhatsApp}
          onPress={onPressWhatsApp}
          status="primary"
          icon={WhatsAppIcon}
        >
          Pedir por Whatsapp
        </Button>
      ) : null}

      {shop.ordersPhoneNumber ? (
        <Button
          style={styles.buttonCall}
          onPress={onPressCall}
          icon={PhoneIcon}
        >
          Llamar
        </Button>
      ) : null}
    </View>
  );
}
