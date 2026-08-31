import React from "react";
import styles from "./Loading.module.css";

export default function Loading() {
  return (
    <span className={styles.default} role="progressbar" aria-label="Cargando" aria-valuemin="0" aria-valuemax="1">
      <svg className={styles.spinner} viewBox="0 0 32 32" aria-hidden="true">
        <circle className={styles.spinnerTrack} cx="16" cy="16" r="14" />
        <circle className={styles.spinnerProgress} cx="16" cy="16" r="14" />
      </svg>
    </span>
  );
}
