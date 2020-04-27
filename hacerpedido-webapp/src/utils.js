export function sanitizeWhatsAppNumber(phone) {
    let newPhone = phone.replace("+", "");
    if (newPhone.startsWith("54")) {  // Sólo para números de Argentina
        let matches = newPhone.match(/^(54)([0-9])([0-9]+)$/);
        if (matches[2] === "0") {  // Verificar que no tenga 0 luego del 54
            newPhone = "549" + matches[3];
        } else if (matches[2] !== "9") { // Verificar que tenga el 9 luego del 54
            newPhone = "549" + matches[2] + matches[3];
        }
    }    

    return newPhone;
}

// console.log(sanitizeWhatsAppNumber("+5402235199043"));
// console.log(sanitizeWhatsAppNumber("+5492235199043"));
// console.log(sanitizeWhatsAppNumber("+542235199043"));
// console.log(sanitizeWhatsAppNumber("542235199043"));
