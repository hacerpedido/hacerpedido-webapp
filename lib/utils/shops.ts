import type { Shop } from "types"

export const getLogoForShop = ({ logo }: Shop) => {
  if (!logo) return ""
  if (logo.startsWith("http://")) return logo

  const filename = logo.substring(logo.lastIndexOf("/") + 1)
  const url = process.env.NEXT_PUBLIC_IMAGE_BUCKET_URL

  return `${url}/${filename}`
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

  return `url(/images/backgrounds/${background})?auto=format,compress&cs=tinysrgb`
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

  const url = process.env.NEXT_PUBLIC_IMAGES_BUCKET_URL

  return `${url}/${background}?auto=format,compress&cs=tinysrgb`
}
