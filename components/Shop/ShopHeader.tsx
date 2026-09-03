// @ts-nocheck
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

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DecoratedLabel from "../DecoratedLabel";
import styles from "./ShopHeader.module.css";

const ShopHeader = ({ isPreview = false, shop = {} }) => {
  const {
    name,
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
  // Cover URL: an uploaded key resolves to the bucket, or the static
  // category fallback under /public. Both are served through next/image
  // so they get AVIF/WebP and responsive widths (see issue #139).
  const coverUrl = getBackgroundForShop(shop);
  const coverAlt = name ? `Portada de ${name}` : "Portada del comercio";

  return (
    <header
      className={styles.container}
      style={{
        backgroundColor:
          getBackgroundColorForCategory(category) ?? "transparent",
      }}
    >
      <Image
        alt={coverAlt}
        aria-hidden="true"
        className={styles.cover}
        fill
        priority
        quality={80}
        sizes="100vw"
        src={coverUrl}
      />
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
            <Image
              alt={name || ""}
              className={styles.logo}
              height={100}
              loading="eager"
              onError={() => setLogoFailed(true)}
              priority
              quality={80}
              sizes="100px"
              src={logo}
              width={100}
            />
          ) : (
            <div
              aria-label={name || ""}
              className={styles.logoPlaceholder}
              role="img"
              style={{ backgroundColor: initialsColor }}
            >
              <span aria-hidden="true" className={styles.logoInitials}>
                {initials}
              </span>
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
