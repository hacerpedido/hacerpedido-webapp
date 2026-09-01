import React from "react";
import styles from "./Switch.module.css";

const SwitchComponent = ({ toggle, value }) => {
  return (
    <div className={styles.container}>
      <span>Delivery</span>

      <label className={styles.switch}>
        <input
          aria-label="Cambiar entre delivery y takeaway"
          checked={value}
          onChange={(event) => toggle(event.target.checked)}
          type="checkbox"
        />
      </label>

      <span>Takeaway</span>
    </div>
  );
};

// https://upmostly.com/tutorials/build-a-react-switch-toggle-component
export default SwitchComponent;
