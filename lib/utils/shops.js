import { getBackgroundForCategory } from "./categoriesHelper";
import isEmpty from "validator/lib/isEmpty";

export function getLogoForShop({ logo }) {
  if (typeof logo === "string" && !isEmpty(logo, { ignore_whitespace: true })) {
    const filename = logo.substring(logo.lastIndexOf("/") + 1);
    const url = process.env.NEXT_PUBLIC_IMAGE_BUCKET_URL

    return `${url}/${filename}`
  }

  return null;
}

export function getBackgroundForShop({ background, category }) {
  if (typeof background === "string" && !isEmpty(background, { ignore_whitespace: true })) {
    const filename = background.substring(background.lastIndexOf("/") + 1);
    const url = process.env.NEXT_PUBLIC_IMAGE_BUCKET_URL

    return `${url}/${filename}`
  }

  return getBackgroundForCategory(category);
}
