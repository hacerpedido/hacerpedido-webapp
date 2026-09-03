// @ts-nocheck
"use client";
import colors from "#assets/colors";
import { PhoneCall as PhoneCallIcon } from "#assets/icons";
import { useCart } from "#lib/context/CartContext";
import { generateCallUrl } from "#lib/utils/utils";

import { useRouter } from "next/navigation";
import styles from "./ShopFooter.module.css";

const ShopFooter = ({ shop }) => {
  const { ordersphonenumber = 1, orderswhatsappnumber = 1 } = shop;
  const { state } = useCart();
  const router = useRouter();
  const totalAmount = state.totalAmount;
  const buttonState = totalAmount
    ? styles.buttonEnabled
    : styles.buttonDisabled;

  const ButtonWhatsapp = () => (
    <button
      aria-label="Review order"
      className={styles.buttonContainer}
      data-testid="review-order"
      disabled={!totalAmount}
      onClick={() => router.push("/cart")}
      type="button"
    >
      <span
        className={`${styles.buttonWhatsApp} ${styles.button} ${buttonState}`}
      >
        <span className={styles.buttonText}>Revisar mi pedido</span>
        <span className={styles.totalAmountContainer}>{totalAmount}</span>
      </span>
    </button>
  );

  const ButtonCall = () => (
    <a
      className={`${styles.buttonCall} ${styles.button} ${styles.buttonContainer}`}
      href={generateCallUrl(ordersphonenumber)}
    >
      <span className={styles.textContainer}>
        <span className={styles.icon}>
          <PhoneCallIcon color={colors.white} />
        </span>
        <span className={styles.buttonText}>Llamar</span>
      </span>
    </a>
  );

  return (
    <footer className={styles.container}>
      {orderswhatsappnumber ? <ButtonWhatsapp /> : <ButtonCall />}
    </footer>
  );
};

export default ShopFooter;
