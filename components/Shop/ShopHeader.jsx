/* eslint-disable react-native/no-raw-text */
import React, { useState } from "react";

import { useRouter } from "next/router";
import { generateCallUrl } from "../../lib/utils/utils";
import { getBackgroundColorForCategory } from "../../lib/utils/categoriesHelper";
import { getLogoForShop, getBackgroundForShop, getShopInitials, getShopInitialsColor } from "../../lib/utils/shops";
import colors from "../../assets/colors";
import * as Icons from "../../assets/icons";
import DecoratedLabel from "../DecoratedLabel";
import styles from "./ShopHeader.module.css";

const ShopHeader = ({ isPreview = false, shop = {} }) => {
  const { name, background, category, address, region, ordersphonenumber, orderswhatsappnumber } = shop;
  const router = useRouter();
  const logo = getLogoForShop(shop);
  const [logoFailed, setLogoFailed] = useState(false);
  const initials = getShopInitials(name);
  const initialsColor = getShopInitialsColor(name);
  const displayAddress = address?.trim() ?? region;
  const opentimes = shop?.opentimes?.trim() !== "" ? shop.opentimes : null;
  const deliverycost = shop?.deliverycost?.trim() !== "" ? shop.deliverycost : null;
  const showButtonCall = ordersphonenumber && orderswhatsappnumber && !isPreview;
  const backgroundImage = getBackgroundForShop(shop);

  const backgroundImageValue = backgroundImage?.startsWith("url(") ? backgroundImage : `url(${backgroundImage})`;
  const containerStyle = {
    "--shop-background-color": getBackgroundColorForCategory(category),
    "--shop-background-image": backgroundImage ? backgroundImageValue : "none",
    "--shop-background-size": background ? "100% auto" : "auto",
  };

  return (
    <header className={styles.container} style={containerStyle}>
      <div className={styles.containerNavigator}>
        {!isPreview && (
          <button type="button" className={styles.buttonBack} onClick={() => router.push("/")} aria-label="Volver">
            <Icons.ArrowLeft color={colors.white} />
          </button>
        )}

        {showButtonCall && (
          <div className={styles.buttonCallContainer}>
            <a className={styles.buttonCall} href={generateCallUrl(ordersphonenumber)}>
              <Icons.PhoneCall />
              <span className={styles.buttonText}>Llamar</span>
            </a>
          </div>
        )}
      </div>

      <div className={styles.containerData}>
        <div className={styles.containerLogo}>
          {logo && !logoFailed ? (
            <img className={styles.logo} src={logo} alt={name || ""} onError={() => setLogoFailed(true)} />
          ) : (
            <div className={styles.logoPlaceholder} style={{ backgroundColor: initialsColor }} aria-label={name || ""}>
              <span className={styles.logoInitials}>{initials}</span>
            </div>
          )}
        </div>
        <h1 className={styles.shopName}>{name?.toLowerCase()}</h1>
        {displayAddress && (
          <DecoratedLabel iconName="pin" text={displayAddress} iconColor={colors.white} textColor={colors.white} fontSize={13} marginBottom={4} />
        )}
        {opentimes && (
          <DecoratedLabel iconName="clock" text={opentimes} iconColor={colors.white} textColor={colors.white} fontSize={13} marginBottom={4} />
        )}
        {deliverycost && (
          <DecoratedLabel iconName="car" text={`Delivery: ${deliverycost}`} iconColor={colors.white} textColor={colors.white} fontSize={13} marginBottom={4} />
        )}
      </div>
    </header>
  );
};

export default ShopHeader;
