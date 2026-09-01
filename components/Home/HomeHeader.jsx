import colors from "#assets/colors";
import * as Icons from "#assets/icons";

import Link from "next/link";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
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
          <Icons.LogoHacerpedido color={colors.white} height={19} width={177} />
          <input
            name="deployedVersion"
            readOnly
            type="hidden"
            value={version}
          />
        </a>
      </Link>

      <button
        className={styles.addShopButton}
        onClick={handleShow}
        type="button"
      >
        ¡Sumá tu comercio!
      </button>

      <Modal onHide={handleClose} show={show}>
        <Modal.Header closeButton>
          <Modal.Title>Ups...</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Por el momento no estamos haciendo nuevas altas. Próximamente habrá
          novedades :)
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose} variant="secondary">
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </header>
  );
}
