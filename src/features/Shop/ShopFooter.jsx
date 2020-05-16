import React from "react";
import { StyleSheet, TouchableHighlight, View, Text } from "react-native";

import { generateWhatsappURL } from "../../utils/utils";
import * as Icons from "../../assets/icons/";

export default ({ shop }) => {
  const { ordersphonenumber, orderswhatsappnumber } = shop;
  let callUrl;
  if (ordersphonenumber) {
    callUrl = "tel:" + encodeURIComponent(ordersphonenumber);
  }

  return (
    <View style={styles.container}>
      {orderswhatsappnumber && (
        <TouchableHighlight
          underlayColor={"none"}
          style={{ flex: ordersphonenumber ? 0.67 : 1 }}
        >
          <div className="bounza">
            <a
              href={generateWhatsappURL(orderswhatsappnumber)}
              style={{ textDecoration: "none" }}
            >
              <View style={[styles.buttonWhatsApp, styles.button]}>
                <Icons.WhatsappFill color={"white"} />
                <Text style={styles.buttonText}>Pedir por WhatsApp</Text>
              </View>
            </a>
          </div>
        </TouchableHighlight>
      )}

      {ordersphonenumber && (
        <TouchableHighlight
          style={{ flex: orderswhatsappnumber ? 0.33 : 1 }}
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
