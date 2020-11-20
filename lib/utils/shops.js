import { getBackgroundForCategory } from "./categoriesHelper";

export function getLogoForShop({ logo }) {
  if (logo) {
    const filename = logo.substring(logo.lastIndexOf("/") + 1);
    return `https://hacerpedido-images.s3.amazonaws.com/${filename}`;
  }

  return null;
}

export function getBackgroundForShop({ background, category }) {
  if (background) {
    const filename = background.substring(background.lastIndexOf("/") + 1);
    return `url(https://hacerpedido-images.s3.amazonaws.com/${filename})`;
  }

  return getBackgroundForCategory(category);
}
