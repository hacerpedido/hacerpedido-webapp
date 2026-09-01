import React from "react";
import styles from "./Loading.module.css";

export default function Loading() {
  return (
    <span
      aria-label="Cargando"
      aria-valuemax="1"
      aria-valuemin="0"
      className={styles.default}
      role="progressbar"
    >
      <svg aria-hidden="true" className={styles.spinner} viewBox="0 0 32 32">
        <circle className={styles.spinnerTrack} cx="16" cy="16" r="14" />
        <circle className={styles.spinnerProgress} cx="16" cy="16" r="14" />
      </svg>
    </span>
  );
}
