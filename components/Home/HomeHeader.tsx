import colors from "#assets/colors";
import * as Icons from "#assets/icons";
import Button from "#components/primitivas/Button";
import Dialog from "#components/primitivas/Dialog";

import Link from "next/link";
import { useState } from "react";
import styles from "./HomeHeader.module.css";

export default function HomeHeader() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const version = process.env.DEPLOYED_GIT_COMMIT_SHA || "";

  return (
    <header className={styles.container}>
      <Link aria-label="HacerPedido — Inicio" href="/">
        <Icons.LogoHacerpedido color={colors.white} height={19} width={177} />
        <input name="deployedVersion" readOnly type="hidden" value={version} />
      </Link>

      <button
        className={styles.addShopButton}
        onClick={handleShow}
        type="button"
      >
        ¡Sumá tu comercio!
      </button>

      <Dialog onClose={handleClose} open={show}>
        <Dialog.Title>Ups...</Dialog.Title>
        <Dialog.Body>
          Por el momento no estamos haciendo nuevas altas. Próximamente habrá
          novedades :)
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={handleClose} variant="secondary">
            Cerrar
          </Button>
        </Dialog.Footer>
      </Dialog>
    </header>
  );
}
