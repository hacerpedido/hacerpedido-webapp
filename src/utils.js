export function toTitleCase(str) {
  if (typeof str !== "string") return "";

  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
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

  return parseFloat(newPrice);
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
