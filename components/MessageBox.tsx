// @ts-nocheck
import { useEffect } from "react";
import styles from "./MessageBox.module.css";

const MessageBox = ({ message, onMessagePress }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onMessagePress();
    }, 10000);
    return () => clearTimeout(timer);
  }, [onMessagePress]);

  return (
    <aside className={styles.container} role="status">
      <button
        aria-label="Cerrar mensaje"
        className={styles.touchable}
        onClick={onMessagePress}
        type="button"
      >
        <span className={styles.text}>{message}</span>
        <span aria-hidden="true" className={styles.textClose}>
          x
        </span>
      </button>
    </aside>
  );
};

export default MessageBox;
