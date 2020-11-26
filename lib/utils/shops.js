import { getBackgroundForCategory } from "./categoriesHelper";
import isEmpty from "validator/lib/isEmpty";

export function getLogoForShop({ logo }) {
  if (typeof logo === "string" && !isEmpty(logo, { ignore_whitespace: true })) {
    const filename = logo.substring(logo.lastIndexOf("/") + 1);
    return `https://hacerpedido-images.s3.amazonaws.com/${filename}`;
  }

  return null;
}

export function getBackgroundForShop({ background, category }) {
  if (typeof background === "string" && !isEmpty(background, { ignore_whitespace: true })) {
    const filename = background.substring(background.lastIndexOf("/") + 1);
    return `url(https://hacerpedido-images.s3.amazonaws.com/${filename})`;
  }

  return getBackgroundForCategory(category);
}
