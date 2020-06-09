import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import {
  TouchableHighlight, StyleSheet, Switch, Text, View
} from "react-native";

import colors from "assets/colors";
import Input from "components/Input";
import {generateWhatsappURL} from "utils/utils";
import {WhatsappFill as WhatsappFillIcon} from "assets/icons";

export default () => {
  const products = useSelector((state) => state.cart.products);
  const shop = useSelector((state) => state.shop.shop);
  const {name, takeaway, orderswhatsappnumber} = shop;
  const [takeawayEnabled, setTakeawayEnabled] = useState(
    takeaway ? true : false
  );

  const {register, setValue, handleSubmit, errors} = useForm({mode: "onChange"});

  useEffect(() => {
    register("takeaway");
    register("name", {required: "Necesitamos tu nombre"});
    register("address", {required: takeawayEnabled || 'Necesitamos tu direccion'});
    register("notes");
  }, [register, takeawayEnabled]);

  const onSubmit = (data) => {
    const url = generateWhatsappURL(orderswhatsappnumber, data, products);
    window.location.href = url;
  };

  const toggleTakeAway = (value) => {
    setTakeawayEnabled(value);
    setValue("takeaway", value);
  };

  const DeliverySwitch = () => (
    <View style={styles.switchContainer}>
      <Text>Delivery</Text>
      <Switch
        trackColor={colors.lightGreen}
        thumbColor={colors.lightGreen}
        activeTrackColor={colors.lightGreen}
        activeThumbColor={colors.lightGreen}
        onValueChange={toggleTakeAway}
        value={takeawayEnabled}
      />
      <Text>Takeaway</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <DeliverySwitch />

      <Input
        name="name"
        label="Tu Nombre"
        placeholder="¿Cómo te llamás?"
        onChangeText={text => setValue("name", text, true)}
        error={errors.name}
      />

      {takeawayEnabled || (
        <Input
          name="address"
          label="Tu Dirección"
          onChangeText={text => setValue("address", text, true)}
          placeholder="¿A dónde lo mandamos?"
          error={errors.address}
        />
      )}

      <Input
        name="notes"
        label="Notas"
        placeholder="¿Querés hacer alguna aclaración?"
        onChangeText={text => setValue("notes", text)}
        multiline
        numberOfLines={3}
      />

      <View style={styles.footerContainer}>
        <Text style={styles.notes}>
          Por favor,
            <Text style={{fontWeight: "bold"}}> confirmá el precio final </Text>
            con el comercio. No somos responsables de modificaciones en el menú.
          </Text>

        <TouchableHighlight
          onPress={handleSubmit(onSubmit)}
          // disabled={!formState.isValid}
          underlayColor="none"
        >
          <div className="bounza">
            <View style={[styles.buttonWhatsApp, styles.button]}>
              <WhatsappFillIcon color="white" />
              <Text style={styles.buttonText}>Pedir a {name}</Text>
            </View>
          </div>
        </TouchableHighlight>
      </View>
    </View >
  );
};


const textStyles = {
  smallText: {
    fontFamily: "Barlow",
    fontSize: 13,
  },
  largeText: {
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: "600",
  },
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 33,
    marginTop: 19,
    padding: 10,
  },
  buttonText: {
    ...textStyles.largeText,
    color: colors.white,
    marginLeft: 5,
  },
  buttonWhatsApp: {
    backgroundColor: colors.addShopButtonBg,
    borderColor: colors.addShopButtonBorder,
  },
  container: {
    backgroundColor: colors.white,
  },
  footerContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 23,
  },
  notes: {
    ...textStyles.smallText,
    color: colors.gray4,
    textAlign: "center",
  },
  switchContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 22,
  },
});
