import colors from "#assets/colors";
import * as Icons from "#assets/icons";
import { getBackgroundColorForCategory } from "#lib/utils/categoriesHelper";
import {
  getBackgroundForShop,
  getLogoForShop,
  getShopInitials,
  getShopInitialsColor,
} from "#lib/utils/shops";
import { generateCallUrl } from "#lib/utils/utils";

import { useRouter } from "next/router";
import React, { useState } from "react";
import DecoratedLabel from "../DecoratedLabel";
import styles from "./ShopHeader.module.css";

const ShopHeader = ({ isPreview = false, shop = {} }) => {
  const {
    name,
    background,
    category,
    address,
    region,
    ordersphonenumber,
    orderswhatsappnumber,
  } = shop;
  const router = useRouter();
  const logo = getLogoForShop(shop);
  const [logoFailed, setLogoFailed] = useState(false);
  const initials = getShopInitials(name);
  const initialsColor = getShopInitialsColor(name);
  const displayAddress = address?.trim() ?? region;
  const opentimes = shop?.opentimes?.trim() !== "" ? shop.opentimes : null;
  const deliverycost =
    shop?.deliverycost?.trim() !== "" ? shop.deliverycost : null;
  const showButtonCall =
    ordersphonenumber && orderswhatsappnumber && !isPreview;
  const backgroundImage = getBackgroundForShop(shop);

  const backgroundImageValue = backgroundImage?.startsWith("url(")
    ? backgroundImage
    : `url(${backgroundImage})`;
  const containerStyle = {
    "--shop-background-color": getBackgroundColorForCategory(category),
    "--shop-background-image": backgroundImage ? backgroundImageValue : "none",
    "--shop-background-size": background ? "100% auto" : "auto",
  };

  return (
    <header className={styles.container} style={containerStyle}>
      <div className={styles.containerNavigator}>
        {!isPreview && (
          <button
            aria-label="Volver"
            className={styles.buttonBack}
            onClick={() => router.push("/")}
            type="button"
          >
            <Icons.ArrowLeft color={colors.white} />
          </button>
        )}

        {showButtonCall && (
          <div className={styles.buttonCallContainer}>
            <a
              className={styles.buttonCall}
              href={generateCallUrl(ordersphonenumber)}
            >
              <Icons.PhoneCall />
              <span className={styles.buttonText}>Llamar</span>
            </a>
          </div>
        )}
      </div>

      <div className={styles.containerData}>
        <div className={styles.containerLogo}>
          {logo && !logoFailed ? (
            <img
              alt={name || ""}
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
        <h1 className={styles.shopName}>{name?.toLowerCase()}</h1>
        {displayAddress && (
          <DecoratedLabel
            fontSize={13}
            iconColor={colors.white}
            iconName="pin"
            marginBottom={4}
            text={displayAddress}
            textColor={colors.white}
          />
        )}
        {opentimes && (
          <DecoratedLabel
            fontSize={13}
            iconColor={colors.white}
            iconName="clock"
            marginBottom={4}
            text={opentimes}
            textColor={colors.white}
          />
        )}
        {deliverycost && (
          <DecoratedLabel
            fontSize={13}
            iconColor={colors.white}
            iconName="car"
            marginBottom={4}
            text={`Delivery: ${deliverycost}`}
            textColor={colors.white}
          />
        )}
      </div>
    </header>
  );
};

export default ShopHeader;
