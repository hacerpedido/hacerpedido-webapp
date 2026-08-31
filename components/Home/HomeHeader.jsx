import React, { useState } from "react";

import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import Link from "next/link";
import * as Icons from "../../assets/icons";
import colors from "../../assets/colors";
import styles from "./HomeHeader.module.css";

export default function HomeHeader() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const version = process.env.DEPLOYED_GIT_COMMIT_SHA || ""

  return (
    <View classList={[styles.container]}>
      <Link href="/">
        <a>
          <Icons.LogoHacerpedido width={177} height={19} color={colors.white} />
          <input name="deployedVersion" value={ version } type="hidden" />
        </a>
      </Link>

      <TouchableOpacity onPress={handleShow}>
        <View>
          <Text classList={[styles.addShopButton]}>¡Sumá tu comercio!</Text>
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

// Styles moved to HomeHeader.module.css
