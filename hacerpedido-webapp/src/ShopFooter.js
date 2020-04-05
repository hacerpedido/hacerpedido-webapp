import React from "react";
import { View, Image, StyleSheet } from "react-native";
import {
  Button,
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme
} from "@ui-kitten/components";
import { useHistory } from "react-router-dom";

import DecoratedLabel from "./components/DecoratedLabel";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap"
  },
  buttonWhatsApp: {
    flex: 0.67,
    margin: 8,
    backgroundColor: "#3ECB7D",
    borderColor: "#37B36E"
  },
  buttonCall: {
    flex: 0.33,
    margin: 8,
    backgroundColor: "#ffb234",
    borderColor: "#ffb234"
  },
});

export default function ShopFooter({ shop }) {
  const history = useHistory();

  const BackIcon = style => <Icon {...style} name="arrow-back" />;

  const BackAction = props => (
    <TopNavigationAction {...props} icon={BackIcon} />
  );

  const renderLeftControl = () => (
    <BackAction
      onPress={() => {
        history.push("/");
      }}
    />
  );

  const WhatsAppIcon = style => <Icon {...style} name="whatsapp" />;
  const PhoneIcon = style => <Icon {...style} name="phone" />;

  const onPressWhatsApp = () => {
    history.push("/");
    // setPressCounter(pressCounter + 1);
  };

  const onPressCall = () => {
    history.push("/");
    // setPressCounter(pressCounter + 1);
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

//<div class="et_pb_text_inner">
{
  /* <a class="boton-whatsapp bounce" title="Pedir por Whatsapp" href="https://api.whatsapp.com/send?phone=5492235492833&amp;text=Hola!%20Quiero%20hacer%20un%20pedido.%20Enviado%20a%20trav%C3%A9s%20de%20*HacerPedido.com*">
    <img src="http://hacerpedido.com/wp-content/uploads/2020/03/whatsapp.png" width="20" height="" alt="" class="wp-image-382 alignnone size-full" style="margin-bottom: -5px;margin-right:4px;"> 
    Pedir por WhatsApp</a>
    <a class="boton-llamar" title="Llamar" href="tel:+542235492833">
        <img src="http://hacerpedido.com/wp-content/uploads/2020/03/telefono.png" width="10" height="25" alt="" class="wp-image-382 alignnone size-full" style="margin-bottom: -2px;margin-right:4px;"> 
        Llamar</a></div> */
}
