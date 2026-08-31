import React from "react";
import * as Icons from "../assets/icons/";
import styles from "./DecoratedLabel.module.css";

// TODO: Este componente tiene una responsabilidad difusa, mucha
// configuración externa. Repensar.

const DecoratedLabel = ({ iconName, text, iconColor, textColor, fontSize, marginBottom }) => {
  const icons = {
    car: <Icons.Car color={iconColor} width={18} />,
    clock: <Icons.Clock color={iconColor} width={18} />,
    pin: <Icons.Pin color={iconColor} width={18} />,
  };

  let displayText = text;
  if (displayText.trim() === "") {
    displayText = null;
  }

  const style = {
    "--label-font-size": `${fontSize ?? 12}px`,
    "--label-margin-bottom": `${marginBottom ?? 0}px`,
    "--label-text-color": textColor,
  };

  return (
    <div className={styles.container} style={style}>
      {displayText && (
        <>
          <span className={styles.icon}>{icons[iconName]}</span>
          <span className={styles.text}>
            {displayText}
          </span>
        </>
      )}
    </div>
  );
};

export default DecoratedLabel;
