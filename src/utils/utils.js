export function toTitleCase(str) {
  if (typeof str !== "string") return "";

  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export function validatePhoneNumber(phone) {
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

export function sanitizeWhatsAppNumber(phone) {
  if (typeof phone !== "string") return phone;

  let newPhone = phone.replace("+", "");
  if (newPhone.startsWith("54")) {
    // Sólo para números de Argentina
    let matches = newPhone.match(/^(54)([0-9])([0-9]+)$/);
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

export const capitalize = (str) => {
  if (typeof str !== "string") return "";

  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function sanitizeProductName(str) {
  if (typeof str !== "string") return str;

  if (str === str.toUpperCase()) {
    return toTitleCase(str);
  }

  return capitalize(str);
}

export function sanitizeAddress(address) {
  if (typeof address !== "string") return "";

  let newAddress = address.trim().replace(/no/gi, "");

  return toTitleCase(newAddress);
}

export function sleep(ms) {
  // Usar: await sleep(1000);
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function sanitizePrice(str) {
  if (typeof str !== "string") return str;

  let newPrice = str
    .trim()
    .replace(/(\$|\.00$|,00$)/g, "")
    .replace(/([.,])(\d{3}\D|\d{3}$)/g, "$2");

  let parsedPrice = parseFloat(newPrice);

  if (Number.isNaN(parsedPrice)) {
    return "";
  }

  return parsedPrice;
}

export function removeEmptyStringElements(obj) {
  for (var prop in obj) {
    if (typeof obj[prop] === "object") {
      removeEmptyStringElements(obj[prop]);
    } else if (obj[prop] === "") {
      delete obj[prop];
    }
  }
  return obj;
}

export function trimObject(obj) {
  for (var prop in obj) {
    if (typeof obj[prop] === "string") {
      obj[prop] = obj[prop].trim();
    }
  }
  return obj;
}

function categoryProducts(products) {
  return products.map(({ amount, name }) => (
    `✅ ${amount} x ${name}`
  )).join("\n")
}


function productListForMessage(productsByCategory) {
  return productsByCategory.map((category) => (
    `*${ category.name }*\n${categoryProducts(category.products)}` 
  )).join("\n")
}

function generateSimpleWhatsappMessage() {
  return "¡Hola! Quiero hacer un pedido via HacerPedido 💪"
}

function generateWhatsappMessage(formData, products) {
  const { name, address, notes } = formData;

  const intro = `¡Hola! soy *${name}* y quiero hacer un pedido via HacerPedido 💪\n\n`;
  const addressStr = address && `📍 *Mi dirección:* ${address}\n`;
  const notesStr = notes && `📝 *Notas:* ${notes}\n`;
  const order = "\n*Mi pedido:*\n" + productListForMessage(products)

  return [intro, addressStr, notesStr, order].join("");
}

export function generateWhatsappURL(number, userData, items) {
  const sanitizedNumber = sanitizeWhatsAppNumber(number);

  const message = typeof userData !== "undefined" ?
    generateWhatsappMessage(userData, items) :
    generateSimpleWhatsappMessage()

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${sanitizedNumber}?text=${encodedMessage}`;
}

export function generateCallUrl(number) {
  return `tel: ${encodeURIComponent(number)}`;
}

export function isBetaTester(slug) {
  const testers = ['club-tri', 'parliamo', 'parliamo-centro', 'parliamo-guemes', 'buka-templo']

  return testers.includes(slug) 
}
