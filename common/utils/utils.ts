import type { Product, CategoryWithProducts, CartFormValues } from "types"

export function toTitleCase(str: string) {
  if (typeof str !== "string") return ""

  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  })
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

export function sanitizeWhatsAppNumber(phone: string) {
  if (typeof phone !== "string") return phone

  let newPhone = phone.replace("+", "")
  if (newPhone.startsWith("54")) {
    // Sólo para números de Argentina
    const matches = newPhone.match(/^(54)([0-9])([0-9]+)$/)

    if (matches) {
      if (matches[2] === "0") {
        // Verificar que no tenga 0 luego del 54
        newPhone = `549${matches[3]}`
      } else if (matches[2] !== "9") {
        // Verificar que tenga el 9 luego del 54
        newPhone = `549${matches[2]}${matches[3]}`
      }
    }
  }

  return newPhone
}

export const capitalize = (str: string) => {
  if (typeof str !== "string") return ""

  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function sanitizeProductName(str: string) {
  if (typeof str !== "string") return str

  if (str === str.toUpperCase()) {
    return toTitleCase(str)
  }

  return capitalize(str)
}

export function sanitizeAddress(address = "") {
  const newAddress = address.trim().replace(/no/gi, "")

  return toTitleCase(newAddress)
}

export function sleep(ms: number) {
  // Usar: await sleep(1000);
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function sanitizePrice(str: string) {
  if (typeof str !== "string") return str

  const newPrice = str
    .trim()
    .replace(/(\$|\.00$|,00$)/g, "")
    .replace(/([.,])(\d{3}\D|\d{3}$)/g, "$2")

  const parsedPrice = parseFloat(newPrice)

  if (Number.isNaN(parsedPrice)) {
    return ""
  }

  return parsedPrice
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function removeEmptyStringElements(obj: any) {
  for (const prop in obj) {
    if (typeof obj[prop] === "object") {
      removeEmptyStringElements(obj[prop])
    } else if (obj[prop] === "") {
      delete obj[prop]
    }
  }
  return obj
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trimObject(obj: any) {
  for (const prop in obj) {
    if (typeof obj[prop] === "string") {
      obj[prop] = obj[prop].trim()
    }
  }
  return obj
}

function categoryProductsForMessage(cartProducts: Product[]) {
  return cartProducts
    .map(({ amount, name }) => `✅ ${amount} x ${name}`)
    .join("\n")
}

function productListForMessage(productsByCategory: CategoryWithProducts[]) {
  return productsByCategory
    .map(
      (category) =>
        `*${category.name}*\n${categoryProductsForMessage(category.products)}`
    )
    .join("\n")
}

function generateSimpleWhatsappMessage() {
  return "¡Hola! Quiero hacer un pedido via HacerPedido 💪"
}

// TODO: : whatsapp api not accepting emoji
function generateWhatsappMessage(
  formData: CartFormValues,
  categoryWithCartProducts: CategoryWithProducts[]
) {
  const { name, address, notes } = formData

  const intro = `¡Hola! soy *${name}* y quiero hacer un pedido via HacerPedido 💪\n\n`
  const addressStr = address && `📍 *Mi dirección:* ${address}\n`
  const notesStr = notes && `📝 *Notas:* ${notes}\n`

  const order = `\n*Mi pedido:*\n${productListForMessage(
    categoryWithCartProducts
  )}`

  return [intro, addressStr, notesStr, order].join("")
}

export function generateWhatsappURL(
  number: string,
  userData: CartFormValues,
  categoriesWithCartProducts: CategoryWithProducts[]
) {
  const sanitizedNumber = sanitizeWhatsAppNumber(number)

  const message =
    typeof userData !== "undefined"
      ? generateWhatsappMessage(userData, categoriesWithCartProducts)
      : generateSimpleWhatsappMessage()

  const encodedMessage = encodeURIComponent(message)

  return `https://wa.me/${sanitizedNumber}?text=${encodedMessage}`
}

export function generateCallUrl(number: string) {
  return `tel: ${encodeURIComponent(number)}`
}
