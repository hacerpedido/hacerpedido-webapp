import * as utils from "./utils";

// Test sanitizePrice
test("remove spaces from prices", () => {
  expect(utils.sanitizePrice("   100   ")).toBe(100);
});
test("remove $ from prices", () => {
  expect(utils.sanitizePrice("$1")).toBe(1);
});
test("remove ,00 from prices", () => {
  expect(utils.sanitizePrice("1,00")).toBe(1);
});
test("remove .00 from prices", () => {
  expect(utils.sanitizePrice("1.00")).toBe(1);
});
test("remove . thousand separators from prices", () => {
  expect(utils.sanitizePrice("1,000")).toBe(1000);
});

// Test sanitizeAddress
test("remove spaces from address", () => {
  expect(utils.sanitizeAddress("  ALGO   ")).toBe("Algo");
});
test("remove NO from address", () => {
  expect(utils.sanitizeAddress("NO")).toBe("");
});
test("remove no from address", () => {
  expect(utils.sanitizeAddress("no")).toBe("");
});
test("ignore undefined address", () => {
  expect(utils.sanitizeAddress(undefined)).toBe("");
});

// Test sanitizeWhatsAppNumber
test("add 9 and remove + to WhatsAppNumber", () => {
  expect(utils.sanitizeWhatsAppNumber("+54223000000")).toBe("549223000000");
});
test("remove 0 from WhatsAppNumber if needed", () => {
  expect(utils.sanitizeWhatsAppNumber("+540223000000")).toBe("549223000000");
});

describe("generateWhatsappURL characterization", () => {
  const products = [
    {
      name: "Comida",
      products: [{ amount: 2, name: "Ñoquis" }],
    },
    {
      name: "Bebidas",
      products: [
        { amount: 1, name: "Café ☕" },
        { amount: 3, name: "Agua" },
      ],
    },
  ];

  test.each([
    [
      "adds the WhatsApp 9 to an international Argentine number",
      "+54223000000",
      "https://wa.me/549223000000?text=%C2%A1Hola!%20Quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA",
    ],
    [
      "removes the Argentine trunk 0 and keeps the WhatsApp 9",
      "+540223000000",
      "https://wa.me/549223000000?text=%C2%A1Hola!%20Quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA",
    ],
    [
      "keeps an Argentine number that already has the WhatsApp 9",
      "+549223000000",
      "https://wa.me/549223000000?text=%C2%A1Hola!%20Quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA",
    ],
  ])("%s", (_description, number, expected) => {
    expect(utils.generateWhatsappURL(number)).toBe(expected);
  });

  test.each([
    [
      "keeps address while omitting absent notes",
      { name: "Ana", address: "Av. Siempre Viva 123", notes: null },
      "https://wa.me/549223000000?text=%C2%A1Hola!%20soy%20*Ana*%20y%20quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA%0A%0A%F0%9F%93%8D%20*Mi%20direcci%C3%B3n%3A*%20Av.%20Siempre%20Viva%20123%0A%0A*Mi%20pedido%3A*%0A*Comida*%0A%E2%9C%85%202%20x%20%C3%91oquis%0A*Bebidas*%0A%E2%9C%85%201%20x%20Caf%C3%A9%20%E2%98%95%0A%E2%9C%85%203%20x%20Agua",
    ],
    [
      "keeps notes while omitting absent address",
      { name: "Ana", address: "", notes: "Sin cebolla" },
      "https://wa.me/549223000000?text=%C2%A1Hola!%20soy%20*Ana*%20y%20quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA%0A%0A%F0%9F%93%9D%20*Notas%3A*%20Sin%20cebolla%0A%0A*Mi%20pedido%3A*%0A*Comida*%0A%E2%9C%85%202%20x%20%C3%91oquis%0A*Bebidas*%0A%E2%9C%85%201%20x%20Caf%C3%A9%20%E2%98%95%0A%E2%9C%85%203%20x%20Agua",
    ],
    [
      "omits both optional fields",
      { name: "Ana", address: null, notes: undefined },
      "https://wa.me/549223000000?text=%C2%A1Hola!%20soy%20*Ana*%20y%20quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA%0A%0A%0A*Mi%20pedido%3A*%0A*Comida*%0A%E2%9C%85%202%20x%20%C3%91oquis%0A*Bebidas*%0A%E2%9C%85%201%20x%20Caf%C3%A9%20%E2%98%95%0A%E2%9C%85%203%20x%20Agua",
    ],
  ])("%s", (_description, userData, expected) => {
    expect(utils.generateWhatsappURL("+54223000000", userData, products)).toBe(expected);
  });

  test("encodes Unicode and literal newlines while preserving category and product order", () => {
    const userData = {
      name: "Ana ñandú",
      address: "Av. Siempre Viva 123",
      notes: "Sin cebolla\n¡Gracias!",
    };

    expect(utils.generateWhatsappURL("+54223000000", userData, products)).toBe(
      "https://wa.me/549223000000?text=%C2%A1Hola!%20soy%20*Ana%20%C3%B1and%C3%BA*%20y%20quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA%0A%0A%F0%9F%93%8D%20*Mi%20direcci%C3%B3n%3A*%20Av.%20Siempre%20Viva%20123%0A%F0%9F%93%9D%20*Notas%3A*%20Sin%20cebolla%0A%C2%A1Gracias!%0A%0A*Mi%20pedido%3A*%0A*Comida*%0A%E2%9C%85%202%20x%20%C3%91oquis%0A*Bebidas*%0A%E2%9C%85%201%20x%20Caf%C3%A9%20%E2%98%95%0A%E2%9C%85%203%20x%20Agua",
    );
  });
});

// Test sanitizeProductName
test("capitalize all uppercase name", () => {
  expect(utils.sanitizeProductName("PRODUCT NAME")).toBe("Product Name");
});
test("capitalize first letter and ignore rest if the name has mixed caps", () => {
  expect(utils.sanitizeProductName("product NAME")).toBe("Product NAME");
});
