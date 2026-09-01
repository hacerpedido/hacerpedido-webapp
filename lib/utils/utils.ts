import type { CartFormData, Product, ProductSection } from "../types";

export function toTitleCase(str: unknown): string {
  if (typeof str !== "string") return "";

  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
}

export function validatePhoneNumber(phone: unknown): boolean | string {
  let valid = false;
  if (typeof phone === "string") {
    const regex = /^(\+?[0-9]{10,13})?$/;

    valid = regex.exec(phone) !== null;
  }

  return (
    valid ||
    "No parece un número de teléfono. Puede ser +542230000000 o +5492230000000. Sin espacios ni guiones."
  );
}

export function sanitizeWhatsAppNumber(phone: unknown): unknown {
  if (typeof phone !== "string") return phone;

  let newPhone = phone.replace("+", "").replace(/[\s-]/g, "");
  if (newPhone.startsWith("54")) {
    // Sólo para números de Argentina
    const matches = newPhone.match(/^(54)([0-9])([0-9]+)$/);
    if (!matches) return newPhone;
    if (matches[2] === "0") {
      // Verificar que no tenga 0 luego del 54
      newPhone = "549" + matches[3];
    } else if (matches[2] !== "9") {
      // Verificar que tenga el 9 luego del 54
      newPhone = "549" + matches[2] + matches[3];
    }
  }

  return newPhone;
}

export const capitalize = (str: unknown): string => {
  if (typeof str !== "string") return "";

  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function sanitizeProductName(str: unknown): unknown {
  if (typeof str !== "string") return str as string | number;

  if (str === str.toUpperCase()) {
    return toTitleCase(str);
  }

  return capitalize(str);
}

export function sanitizeAddress(address: unknown): string {
  if (typeof address !== "string") return "";

  const newAddress = address.trim().replace(/no/gi, "");

  return toTitleCase(newAddress);
}

export function sleep(ms: number): Promise<void> {
  // Usar: await sleep(1000);
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function sanitizePrice(str: unknown): string | number {
  if (typeof str !== "string") return str as string | number;

  const newPrice = str
    .trim()
    .replace(/(\$|\.00$|,00$)/g, "")
    .replace(/([.,])(\d{3}\D|\d{3}$)/g, "$2");

  const parsedPrice = parseFloat(newPrice);

  if (Number.isNaN(parsedPrice)) {
    return "";
  }

  return parsedPrice;
}

export function removeEmptyStringElements<T extends Record<string, unknown>>(
  obj: T,
): T {
  for (const prop in obj) {
    if (typeof obj[prop] === "object" && obj[prop] !== null) {
      removeEmptyStringElements(obj[prop] as Record<string, unknown>);
    } else if (obj[prop] === "") {
      delete obj[prop];
    }
  }
  return obj;
}

export function trimObject<T extends Record<string, unknown>>(obj: T): T {
  for (const prop in obj) {
    if (typeof obj[prop] === "string") {
      (obj as Record<string, unknown>)[prop] = (obj[prop] as string).trim();
    }
  }
  return obj;
}

function categoryProducts(products: Product[]): string {
  return products
    .map(({ amount, name }) => `✅ ${amount} x ${name}`)
    .join("\n");
}

function productListForMessage(productsByCategory: ProductSection[]): string {
  return productsByCategory
    .map(
      (category) =>
        `*${category.name}*\n${categoryProducts(category.products)}`,
    )
    .join("\n");
}

function generateSimpleWhatsappMessage() {
  return "¡Hola! Quiero hacer un pedido via HacerPedido 💪";
}

function generateWhatsappMessage(
  formData: CartFormData,
  products: ProductSection[],
): string {
  const { name, address, notes } = formData;

  const intro = `¡Hola! soy *${name}* y quiero hacer un pedido via HacerPedido 💪\n\n`;
  const addressStr = address && `📍 *Mi dirección:* ${address}\n`;
  const notesStr = notes && `📝 *Notas:* ${notes}\n`;
  const order = "\n*Mi pedido:*\n" + productListForMessage(products);

  return [intro, addressStr, notesStr, order].join("");
}

export function generateWhatsappURL(
  number: unknown,
  userData?: CartFormData | null,
  items: ProductSection[] = [],
): string {
  const sanitizedNumber = sanitizeWhatsAppNumber(number);

  const message =
    typeof userData !== "undefined"
      ? generateWhatsappMessage(userData as CartFormData, items)
      : generateSimpleWhatsappMessage();

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${sanitizedNumber}?text=${encodedMessage}`;
}

export function generateCallUrl(number: string): string {
  return `tel: ${encodeURIComponent(number)}`;
}

export function randomString(
  length: number,
  characters = "abcdefghijklmnopqrstuvwxyz0123456789",
): string {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
