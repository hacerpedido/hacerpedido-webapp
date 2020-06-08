import React from "react";
import {useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {StyleSheet, TouchableHighlight, View, Text} from "react-native";
import {generateCallUrl, generateWhatsappURL, isBetaTester} from "utils/utils";
import colors from "assets/colors";
import {WhatsappFill as WhatsappFillIcon, PhoneCall as PhoneCallIcon} from "assets/icons";

export default ({shop}) => {
  const {ordersphonenumber, orderswhatsappnumber, slug} = shop;
  const history = useHistory();
  const totalAmount = useSelector((state) => state.shop.totalAmount);
  const statusOpacity = totalAmount ? {opacity: 1} : {opacity: 0.7}

  const ButtonWhatsapp = () => (
    <TouchableHighlight
      disabled={!totalAmount}
      underlayColor={"none"}
      onPress={() => history.push("/cart")}
      style={styles.buttonContainer}>

      <View style={[styles.buttonWhatsApp, styles.button, statusOpacity]}>
        <Text style={styles.buttonText}> Revisar mi pedido </Text>
        <View style={styles.totalAmountContainer}>
          <Text style={styles.totalAmountText}> {totalAmount} </Text>
        </View>
      </View>
    </TouchableHighlight>
  )

  const ButtonCall = () => (
    // TODO: Extract component, to be reused in header
    <TouchableHighlight
      underlayColor={"none"}
      style={styles.buttonContainer}>
      <a href={generateCallUrl(ordersphonenumber)} style={{textDecoration: "none"}}>
        <View style={[styles.buttonCall, styles.button]}>
          <Text style={styles.textContainer} numberOfLines={1}>
            <View style={styles.icon}><PhoneCallIcon color={colors.white} /></View>
            <Text style={styles.buttonText}>Llamar</Text>
          </Text>
        </View>
      </a>
    </TouchableHighlight>
  )

  return (
    <View style={styles.container}>
      {/* { isBetaTester(slug) ? <ButtonWhatsapp /> : <ButtonCall />} */}

      {isBetaTester(slug) && orderswhatsappnumber && <ButtonWhatsapp />}
      {isBetaTester(slug) && !orderswhatsappnumber && <ButtonCall />}

      {!isBetaTester(slug) && orderswhatsappnumber &&
        <TouchableHighlight
          underlayColor={"none"}
          style={{flex: ordersphonenumber ? 0.67 : 1}} >
          <div className="bounza">
            <a href={generateWhatsappURL(orderswhatsappnumber)}
              style={{textDecoration: "none"}} >
              <View style={[styles.buttonWhatsApp, styles.button, styles.buttonWhatsApp2]}>
                <Text style={styles.textContainer} numberOfLines={1}>
                  <View style={styles.icon}><WhatsappFillIcon color={colors.white} /></View>
                  <Text style={styles.buttonText}>Pedir por WhatsApp</Text>
                </Text>
              </View>
            </a>
          </div>
        </TouchableHighlight>
      }

      {!isBetaTester(slug) && ordersphonenumber &&
        <TouchableHighlight style={{flex: orderswhatsappnumber ? 0.33 : 1}}
          underlayColor={"none"} >
          <a href={generateCallUrl(ordersphonenumber)}
            style={{textDecoration: "none"}} >
            <View style={[styles.buttonCall, styles.button, styles.buttonCall2]}>
              <Text style={styles.textContainer} numberOfLines={1}>
                <View style={styles.icon}><PhoneCallIcon color={colors.white} /></View>
                <Text style={styles.buttonText}>Llamar</Text>
              </Text>
            </View>
          </a>
        </TouchableHighlight>
      }

    </View>
  );
};

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
  buttonCall2: {
    marginLeft: 0,
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
