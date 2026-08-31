import React, { useState } from "react";

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

  const version = process.env.DEPLOYED_GIT_COMMIT_SHA || "";

  return (
    <header className={styles.container}>
      <Link href="/">
        <a>
          <Icons.LogoHacerpedido width={177} height={19} color={colors.white} />
          <input name="deployedVersion" value={version} type="hidden" readOnly />
        </a>
      </Link>

      <button type="button" className={styles.addShopButton} onClick={handleShow}>
        ¡Sumá tu comercio!
      </button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ups...</Modal.Title>
        </Modal.Header>
        <Modal.Body>Por el momento no estamos haciendo nuevas altas. Próximamente habrá novedades :)</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </header>
  );
}
