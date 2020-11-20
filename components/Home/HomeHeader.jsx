import React, { useState } from "react";

import { StyleSheet, Text, View } from "react-native";
import { TouchableHighlight, TouchableOpacity, Modal } from "react-native";

import Link from "next/link";
import * as Icons from "../../assets/icons";
import colors from "../../assets/colors";

export default function HomeHeader() {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const isSSR = (typeof window === "undefined");

  return (
    <View style={styles.container}>
      <Link href="/">
        <a>
          <Icons.LogoHacerpedido width={177} height={19} color={colors.white} />
        </a>
      </Link>

      <TouchableOpacity onPress={toggleModal}>
        <View>
          <Text style={styles.addShopButton}>¡Sumá tu comercio!</Text>
        </View>
      </TouchableOpacity>

      {isSSR && (
        <Modal animationType="fade" visible={modalVisible}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Por el momento no estamos haciendo nuevas altas. Próximamente
                habrá novedades :)
              </Text>

              <TouchableHighlight onPress={toggleModal}>
                <View>
                  <Text style={styles.addShopButton}>Cerrar</Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
      )}

      {/*
      <a
        href="https://comercios.hacerpedido.com/"
        style={{ textDecoration: "none" }}
      >
        <Text style={styles.addShopButton}>¡Sumá tu comercio!</Text>
      </a>
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  addShopButton: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.button1,
    borderRadius: 3,
    borderWidth: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
    padding: 7,
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.orangeHP,
    borderBottomWidth: 1,
    borderColor: colors.filterButtonBorder,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "500",
    padding: 32,
  },
  modalView: {
    alignContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    display: "flex",
    flex: 1,
    flexFlow: "column",
    justifyContent: "center",
  },
});
