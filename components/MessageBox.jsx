/* eslint-disable react-native/no-raw-text */
import React, { useEffect } from "react";
import styles from "./MessageBox.module.css";

const MessageBox = ({ message, onMessagePress }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onMessagePress();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onMessagePress]);

  return (
    <aside className={styles.container} role="status">
      <button
        type="button"
        className={styles.touchable}
        aria-label="Cerrar mensaje"
        onClick={onMessagePress}
      >
        <span className={styles.text}>{message}</span>
        <span className={styles.textClose} aria-hidden="true">
          x
        </span>
      </button>
    </aside>
  );
};

export default MessageBox;
