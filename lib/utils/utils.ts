import type { CartItem, CartFormValues, Product } from "types"

// NOTE: Replaces the use of this type with an array of products
type CategoryWithProducts = {
  name: string
  products: Product[]
}

export function validateUUID(str: string) {
  // Regular expression to check if string is a valid UUID
  const regexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi

  return regexExp.test(str)
}

export function validatePhoneNumber(phone: string) {
  let valid = false
  if (typeof phone === "string") {
    const regex = /^(\+?[0-9]{10,13})?$/

    valid = regex.exec(phone) !== null
  }

  return (
    valid ||
    "No parece un número de teléfono. Puede ser +542230000000 o +5492230000000. Sin espacios ni guiones."
  )
}

// NOTE: Modifies string to be titlecase
export function sanitizeProductName(name: string) {
  return name.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trimObject(obj: any) {
  for (const prop in obj) {
    if (typeof obj[prop] === "string") obj[prop] = obj[prop].trim()
  }

  return obj
}

function categoryProductsForMessage(cartProducts: CartItem[]) {
  return cartProducts
    .map(({ quantity, name }) => `✅ ${quantity} x ${name}`)
    .join("\n")
}

function productListForMessage(productsByCategory: CategoryWithProducts[]) {
  return productsByCategory
    .map(
      ({ name, products }) =>
        `*${name}*\n${categoryProductsForMessage(products)}`
    )
    .join("\n")
}

function generateWhatsappMessage(
  formData: CartFormValues,
  categoriesWithProducts: CategoryWithProducts[]
) {
  const { name, address, notes } = formData

  const intro = `¡Hola! soy *${name}* y quiero hacer un pedido via HacerPedido 💪\n\n`
  const addressStr = address && `📍 *Mi dirección:* ${address}\n`
  const notesStr = notes && `📝 *Notas:* ${notes}\n`

  const order = `\n*Mi pedido:*\n${productListForMessage(
    categoriesWithProducts
  )}`

  return [intro, addressStr, notesStr, order].join("")
}

export function generateWhatsappURL(
  number: string,
  userData: CartFormValues,
  categoriesWithProducts: CategoryWithProducts[]
) {
  const sanitizedNumber = number.replace(/[^\w\s]/gi, "").replace(/ /g, "")

  const message = generateWhatsappMessage(userData, categoriesWithProducts)

  const encodedMessage = encodeURIComponent(message)

  return `https://wa.me/${sanitizedNumber}?text=${encodedMessage}`
}

export function generateCallUrl(phoneNumber: string) {
  return `tel: ${encodeURIComponent(phoneNumber)}`
}
