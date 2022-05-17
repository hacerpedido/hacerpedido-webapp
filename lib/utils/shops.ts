import type { Shop } from "types"

// TODO: if there's no logo generate one automatically
export const getLogoForShop = ({ logo }: Shop) => {
  if (!logo) return ""

  const filename = logo.substring(logo.lastIndexOf("/") + 1)
  // TODO: replace url with an env var
  return `https://hacerpedido2-images.s3.amazonaws.com/${filename}`
}

export const getBackgroundForCategory = (category: string) => {
  let background = ""

  switch (category) {
    case "Comida":
      background = `comida.jpg`
      break
    case "Cervecerías":
      background = `cerveceria.jpg`
      break
    case "Helados y Postres":
      background = `helados.jpg`
      break
    case "Panadería":
      background = `panaderia.jpg`
      break
    case "Saludable":
      background = `saludable.jpg`
      break
    case "Almacén / Kiosko":
      background = `kiosko.jpg`
      break
    case "Cafetería":
      background = `cafe.jpg`
      break
    case "Bebidas":
      background = `bebida.jpg`
      break
    case "Otros":
      background = `otros.jpg`
      break
    case "Farmacia":
      background = `farmacia.jpg`
      break
    case "Fruta y Verdura":
      background = `verduleria.jpg`
      break
    default:
      break
  }

  return `url(/images/backgrounds/${background})`
}

function isURL(s) {
  let url
  try {
    url = new URL(s)
  } catch (e) {
    return false
  }
  return /https?/.test(url.protocol)
}

// BUG: default background not working?
export const getBackgroundForShop = ({ background, category }: Shop) => {
  if (!background) return getBackgroundForCategory(category)
  if (isURL(background)) return background

  // TODO: replace url with an env var
  return `url(https://hacerpedido2-images.s3.amazonaws.com/${background})`
}
