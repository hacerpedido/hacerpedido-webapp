import React, { useState } from "react";
import { getLogoForShop, getShopInitials, getShopInitialsColor } from "../../lib/utils/shops";

import DecoratedLabel from "../DecoratedLabel";
import colors from "../../assets/colors";
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
            <img className={styles.logo} src={logo} alt={name} onError={() => setLogoFailed(true)} />
          ) : (
            <div className={styles.logoPlaceholder} style={{ backgroundColor: initialsColor }} aria-label={name || ""}>
              <span className={styles.logoInitials}>{initials}</span>
            </div>
          )}
        </div>
        <div className={styles.containerLabels}>
          <h2 className={styles.shopName}>{name.toLowerCase()}</h2>
          {address && (
            <DecoratedLabel iconName="pin" text={address} iconColor={iconColor} textColor={colors.lightGrey} />
          )}
          {opentimes && (
            <DecoratedLabel iconName="clock" text={opentimes} iconColor={iconColor} textColor={colors.lightGrey} />
          )}
          {deliverycost && (
            <DecoratedLabel iconName="car" text={deliverycost} iconColor={iconColor} textColor={colors.lightGrey} />
          )}
        </div>
      </div>
    </article>
  );
};

export default ShopCard;

const iconColor = "#C5CEE0";
