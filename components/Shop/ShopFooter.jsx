import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { StyleSheet, TouchableHighlight, View, Text } from "react-native";
import { generateCallUrl } from "../../lib/utils/utils";
import colors from "../../assets/colors";
import { PhoneCall as PhoneCallIcon } from "../../assets/icons";

const ShopFooter = ({ shop }) => {
  const { ordersphonenumber = 1, orderswhatsappnumber = 1 } = shop;
  const router = useRouter();
  const totalAmount = useSelector((state) => state.shop.totalAmount);
  const statusOpacity = totalAmount ? { opacity: 1 } : { opacity: 0.7 };

  const ButtonWhatsapp = () => (
    <TouchableHighlight
      disabled={!totalAmount}
      underlayColor={"none"}
      onPress={() => router.push("/cart")}
      style={styles.buttonContainer}
    >
      <View style={[styles.buttonWhatsApp, styles.button, statusOpacity]}>
        <Text style={styles.buttonText}> Revisar mi pedido </Text>
        <View style={styles.totalAmountContainer}>
          <Text style={styles.totalAmountText}> {totalAmount} </Text>
        </View>
      </View>
    </TouchableHighlight>
  );

  const onCall = (number) => (window.location.href = generateCallUrl(number));

  const ButtonCall = () => (
    // TODO: Extract component, to be reused in header
    <TouchableHighlight
      onPress={() => onCall(ordersphonenumber)}
      underlayColor={"none"}
      style={styles.buttonContainer}
    >
      <View style={[styles.buttonCall, styles.button]}>
        <Text style={styles.textContainer} numberOfLines={1}>
          <View style={styles.icon}>
            <PhoneCallIcon color={colors.white} />
          </View>
          <Text style={styles.buttonText}>Llamar</Text>
        </Text>
      </View>
    </TouchableHighlight>
  );

  return (
    <View style={styles.container}>
      {orderswhatsappnumber ? <ButtonWhatsapp /> : <ButtonCall />}
    </View>
  );
};

export default ShopFooter;

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
    textAlign: "center",
  },
  buttonCall: {
    backgroundColor: colors.orangeHP,
    borderColor: colors.filterButtonBorder,
  },
  buttonContainer: {
    flex: 1,
  },
  buttonText: {
    color: colors.white,
    flex: 1,
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  buttonWhatsApp: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.button1,
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
