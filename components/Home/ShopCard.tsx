// @ts-nocheck
import colors from "#assets/colors";
import {
  getLogoForShop,
  getShopInitials,
  getShopInitialsColor,
} from "#lib/utils/shops";

import React, { useState } from "react";
import DecoratedLabel from "../DecoratedLabel";
import styles from "./ShopCard.module.css";

const ShopCard = ({ shop }) => {
  const { name, address, opentimes, deliverycost } = shop;
  const logo = getLogoForShop(shop);
  const [logoFailed, setLogoFailed] = useState(false);
  const initials = getShopInitials(name);
  const initialsColor = getShopInitialsColor(name);

  return (
    <article className={styles.card}>
      <div className={styles.container}>
        <div className={styles.containerLogo}>
          {logo && !logoFailed ? (
            <img
              alt={name}
              className={styles.logo}
              onError={() => setLogoFailed(true)}
              src={logo}
            />
          ) : (
            <div
              aria-label={name || ""}
              className={styles.logoPlaceholder}
              style={{ backgroundColor: initialsColor }}
            >
              <span className={styles.logoInitials}>{initials}</span>
            </div>
          )}
        </div>
        <div className={styles.containerLabels}>
          <h2 className={styles.shopName}>{name.toLowerCase()}</h2>
          {address && (
            <DecoratedLabel
              iconColor={iconColor}
              iconName="pin"
              text={address}
              textColor={colors.lightGrey}
            />
          )}
          {opentimes && (
            <DecoratedLabel
              iconColor={iconColor}
              iconName="clock"
              text={opentimes}
              textColor={colors.lightGrey}
            />
          )}
          {deliverycost && (
            <DecoratedLabel
              iconColor={iconColor}
              iconName="car"
              text={deliverycost}
              textColor={colors.lightGrey}
            />
          )}
        </div>
      </div>
    </article>
  );
};

export default ShopCard;

const iconColor = "#C5CEE0";
