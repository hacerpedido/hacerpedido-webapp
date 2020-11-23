import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Controller } from "react-hook-form";
import TimeAgo from "react-timeago";
import spanishStrings from "react-timeago/lib/language-strings/es";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import Modal from "react-bootstrap/Modal";
import dynamic from 'next/dynamic'

import UploadImage from "./UploadImage";
import Input from "../ShopInput";
import theme from "../../assets/theme";
import { validatePhoneNumber } from "../../lib/utils/utils";


// const DynamicComponentWithNoSSR = dynamic(
//   import('./UploadImage').then((mod) => mod.UploadImage),
//   { ssr: false }
// )

const formatter = buildFormatter(spanishStrings);

export default function EditShop({
  shop,
  control,
  errors,
  handleSubmit,
  getValues,
  isSaving,
}) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const buttonStyles = {
    alignItems: "center",
    backgroundColor: isSaving ? theme.colors.lightGrey : theme.colors.button1,
    borderRadius: 5,
    flexDirection: "row",
    marginVertical: 10,
    padding: 10,
  };

  function onCloseModal() {
    setModalVisible(false);
  }

  return (
    <>
      <Modal show={show} onHide={handleClose}>
      <UploadImage handleClose={handleClose} />
      </Modal>

      {/* <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalViewContainer}>
          <UploadImage onCloseModal={onCloseModal} />
        </View>
      </Modal> */}
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>Datos de tu Comercio</Text>
            <Text style={styles.updatedAt}>
              <Text>Actualizado </Text>
              <TimeAgo
                date={shop.updated_at}
                formatter={formatter}
                minPeriod={60}
              />
            </Text>
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              underlayColor={"none"}
              onPress={handleShow}
              style={styles.buttonBase}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>Background</Text>
            </TouchableOpacity>
            <TouchableOpacity
              underlayColor={"none"}
              onPress={handleShow}
              style={styles.buttonBase}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>Logo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              underlayColor={"none"}
              onPress={handleSubmit}
              style={buttonStyles}
              disabled={isSaving}
            >
              <>
                <Text style={styles.buttonText}>Guardar</Text>
                {isSaving && (
                  <ActivityIndicator
                    animating={isSaving}
                    color={theme.colors.white}
                  />
                )}
              </>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.formContainer}>
            <View style={styles.formColumnLeft}>
              <Controller
                as={Input}
                control={control}
                name="name"
                label="Nombre del Comercio:"
                defaultValue={shop.name}
                rules={{
                  required: {
                    value: true,
                    message: "El nombre del comercio es requerido.",
                  },
                }}
                error={errors.name}
                maxLength={50}
              />
              <Controller
                as={Input}
                control={control}
                name="address"
                label="Dirección:"
                defaultValue={shop.address}
                error={errors.address}
                maxLength={50}
              />
              <Controller
                as={Input}
                control={control}
                name="opentimes"
                label="Horario:"
                defaultValue={shop.opentimes}
                error={errors.opentimes}
                maxLength={50}
              />
              <Controller
                as={Input}
                control={control}
                name="deliverycost"
                label="Costo del Delivery:"
                defaultValue={shop.deliverycost}
                error={errors.deliverycost}
                maxLength={50}
              />
            </View>
            <View style={styles.formColumnRight}>
              <Controller
                as={Input}
                control={control}
                name="orderswhatsappnumber"
                label="WhatsApp del comercio:"
                defaultValue={shop.orderswhatsappnumber}
                error={errors.orderswhatsappnumber}
                rules={{
                  validate: {
                    matchesAtLeastAPhone: (value) => {
                      if (value != null && value !== "") {
                        const phoneValidationResult = validatePhoneNumber(
                          value
                        );
                        if (typeof phoneValidationResult === "string") {
                          return phoneValidationResult;
                        }
                      }
                      const { ordersphonenumber } = getValues();
                      return (
                        (ordersphonenumber != null &&
                          ordersphonenumber !== "") ||
                        (value != null && value !== "") ||
                        "Al menos un número de teléfono debe ser ingresado."
                      );
                    },
                  },
                }}
                maxLength={20}
                placeholder={"Escribilo así: +5492234470974"}
                pattern={"\\+?[0-9]*"}
                keyboardType={"phone-pad"}
                onChange={([e]) => {
                  let value = e.target.value ?? "";
                  return value.replace(/[^0-9+]/g, "");
                }}
              />
              <Controller
                as={Input}
                control={control}
                name="ordersphonenumber"
                label="Teléfono Fijo:"
                defaultValue={shop.ordersphonenumber}
                error={errors.ordersphonenumber}
                maxLength={20}
                placeholder={"Escribilo así: +5492234470974"}
                pattern={"\\+?[0-9]*"}
                keyboardType={"phone-pad"}
                onChange={([e]) => {
                  let value = e.target.value ?? "";
                  return value.replace(/[^0-9+]/g, "");
                }}
                rules={{
                  validate: {
                    matchesAtLeastAPhone: (value) => {
                      if (value != null && value !== "") {
                        const phoneValidationResult = validatePhoneNumber(
                          value
                        );
                        if (typeof phoneValidationResult === "string") {
                          return phoneValidationResult;
                        }
                      }
                      const { orderswhatsappnumber } = getValues();
                      return (
                        (orderswhatsappnumber != null &&
                          orderswhatsappnumber !== "") ||
                        (value != null && value !== "") ||
                        "Al menos un número de teléfono debe ser ingresado."
                      );
                    },
                  },
                }}
              />
              <Controller
                as={Input}
                control={control}
                placeholder={"¿Querés hacer alguna aclaración?"}
                name="notes"
                multiline
                numberOfLines={3.5}
                label="Notas:"
                defaultValue={shop.notes}
                error={errors.notes}
                maxLength={1000}
              />
              {/*
                logo
                background
            */}
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    alignItems: "center",
    backgroundColor: theme.colors.gray4,
    borderRadius: 5,
    flexDirection: "row",
    marginRight: 10,
    padding: 10,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    alignItems: "baseline",
    flexDirection: "row",
    // padding: 10,
  },
  container: {
    backgroundColor: theme.colors.lightBackground,
    justifyContent: "center",
  },
  formColumnLeft: {
    backgroundColor: theme.colors.white,
    flex: 0.5,
    marginRight: 8,
    paddingLeft: 20,
    paddingVertical: 20,
  },
  formColumnRight: {
    backgroundColor: theme.colors.white,
    flex: 0.5,
    padding: 20,
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.gray2,
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
  },
  title: {
    ...theme.text.title,
    marginVertical: 10,
  },
  titleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  titleTextContainer: {
    alignItems: "baseline",
    flexDirection: "row",
  },
  updatedAt: {
    ...theme.text.quiet,
    marginHorizontal: 10,
  },
});
