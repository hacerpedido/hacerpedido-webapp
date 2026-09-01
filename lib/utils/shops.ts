import isEmpty from "validator/lib/isEmpty";
import type { Shop } from "../types";
import { getBackgroundForCategory } from "./categoriesHelper";

export function getLogoForShop({ logo }: Pick<Shop, "logo">): string | null {
  if (typeof logo === "string" && !isEmpty(logo, { ignore_whitespace: true })) {
    if (logo.startsWith("/")) {
      return logo;
    }

    if (/^https?:\/\//i.test(logo)) {
      return logo;
    }

    const filename = logo.substring(logo.lastIndexOf("/") + 1);
    const url = process.env.NEXT_PUBLIC_IMAGE_BUCKET_URL;

    return `${url}/${filename}`;
  }

  return null;
}

export function getShopInitials(name = ""): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function getShopInitialsColor(name = ""): string {
  const colors = [
    "#D45D5D",
    "#D4934A",
    "#4D9A78",
    "#4C7FB3",
    "#8B6BB1",
    "#B56B91",
  ];
  const hash = Array.from(name).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return colors[hash % colors.length];
}

export function getBackgroundForShop({
  background,
  category,
}: Pick<Shop, "background" | "category">): string {
  if (
    typeof background === "string" &&
    !isEmpty(background, { ignore_whitespace: true })
  ) {
    const filename = background.substring(background.lastIndexOf("/") + 1);
    const url = process.env.NEXT_PUBLIC_IMAGE_BUCKET_URL;

    return `${url}/${filename}`;
  }

  return getBackgroundForCategory(category ?? "");
}
