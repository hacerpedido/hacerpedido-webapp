import isEmpty from "validator/lib/isEmpty"

import type { Shop } from "../../types"

import { getBackgroundForCategory } from "./categories"

export function getLogoForShop({ logo }: Shop) {
  if (!isEmpty(logo, { ignore_whitespace: true })) {
    const filename = logo.substring(logo.lastIndexOf("/") + 1)
    return `https://hacerpedido2-images.s3.amazonaws.com/${filename}`
  }

  return ""
}

export function getBackgroundForShop({
  background,
  category,
}: {
  background: string
  category: string
}) {
  if (!isEmpty(background, { ignore_whitespace: true })) {
    const filename = background.substring(background.lastIndexOf("/") + 1)
    return `url(https://hacerpedido2-images.s3.amazonaws.com/${filename})`
  }

  return getBackgroundForCategory(category)
}
