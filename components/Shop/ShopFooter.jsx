import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

import { generateCallUrl } from "../../lib/utils/utils";
import colors from "../../assets/colors";
import { PhoneCall as PhoneCallIcon } from "../../assets/icons";
import styles from "./ShopFooter.module.css";

const ShopFooter = ({ shop }) => {
  const { ordersphonenumber = 1, orderswhatsappnumber = 1 } = shop;
  const router = useRouter();
  const totalAmount = useSelector((state) => state.shop.totalAmount);
  const buttonState = totalAmount ? styles.buttonEnabled : styles.buttonDisabled;

  const ButtonWhatsapp = () => (
    <button
      aria-label="Review order"
      className={styles.buttonContainer}
      disabled={!totalAmount}
      onClick={() => router.push("/cart")}
      data-testid="review-order"
      type="button"
    >
      <span className={`${styles.buttonWhatsApp} ${styles.button} ${buttonState}`}>
        <span className={styles.buttonText}>Revisar mi pedido</span>
        <span className={styles.totalAmountContainer}>{totalAmount}</span>
      </span>
    </button>
  );

  const ButtonCall = () => (
    <a className={`${styles.buttonCall} ${styles.button} ${styles.buttonContainer}`} href={generateCallUrl(ordersphonenumber)}>
      <span className={styles.textContainer}>
        <span className={styles.icon}>
          <PhoneCallIcon color={colors.white} />
        </span>
        <span className={styles.buttonText}>Llamar</span>
      </span>
    </a>
  );

  return <footer className={styles.container}>{orderswhatsappnumber ? <ButtonWhatsapp /> : <ButtonCall />}</footer>;
};

export default ShopFooter;
