import React, { useState } from "react";

import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import Link from "next/link";
import * as Icons from "../../assets/icons";
import colors from "../../assets/colors";

export default function HomeHeader() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const version = process.env.DEPLOYED_GIT_COMMIT_SHA || ""

  return (
    <View style={styles.container}>
      <Link href="/">
        <a>
          <Icons.LogoHacerpedido width={177} height={19} color={colors.white} />
          <input name="deployedVersion" value={ version } type="hidden" />
        </a>
      </Link>

      <TouchableOpacity onPress={handleShow}>
        <View>
          <Text style={styles.addShopButton}>¡Sumá tu comercio!</Text>
        </View>
      </TouchableOpacity>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ups...</Modal.Title>
        </Modal.Header>
        <Modal.Body>Por el momento no estamos haciendo nuevas altas. Próximamente habrá novedades :)</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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
