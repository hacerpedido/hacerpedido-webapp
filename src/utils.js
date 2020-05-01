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
// console.log(sanitizeWhatsAppNumber("+5402235199043"));
// console.log(sanitizeWhatsAppNumber("+5492235199043"));
// console.log(sanitizeWhatsAppNumber("+542235199043"));
// console.log(sanitizeWhatsAppNumber("542235199043"));

// npx babel --presets es2015 -d build-scripts/ src/utils.js && node build-scripts/src/utils.js
export function sanitizeAddress(address) {
  if (typeof address !== "string") return "";

  let newAddress = address.trim().replace(/no/gi, "");

  return toTitleCase(newAddress);
}
// console.log(sanitizeAddress("  ALGO   "));
// console.log(sanitizeAddress("           ALGO MAS ALGO"));
// console.log(sanitizeAddress("    NO"));
// console.log(sanitizeAddress("no"));
// console.log(sanitizeAddress(undefined));
