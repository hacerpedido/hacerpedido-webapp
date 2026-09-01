import * as utils from "./utils";

// ── sanitizeWhatsAppNumber ─────────────────────────────────────────────────────

describe("sanitizeWhatsAppNumber", () => {
  test("adds 9 and strips + for Argentine numbers", () => {
    expect(utils.sanitizeWhatsAppNumber("+54223000000")).toBe("549223000000");
  });

  test("removes extra 0 after 54 and adds 9", () => {
    expect(utils.sanitizeWhatsAppNumber("+540223000000")).toBe("549223000000");
  });

  test("preserves number already starting with 549", () => {
    expect(utils.sanitizeWhatsAppNumber("549223000000")).toBe("549223000000");
  });

  test("adds 9 for Argentine number without 9 or 0", () => {
    expect(utils.sanitizeWhatsAppNumber("54223000000")).toBe("549223000000");
  });

  test("non-string inputs pass through", () => {
    expect(utils.sanitizeWhatsAppNumber(null)).toBe(null);
    expect(utils.sanitizeWhatsAppNumber(undefined)).toBe(undefined);
    expect(utils.sanitizeWhatsAppNumber(54223000000)).toBe(54223000000);
  });

  test("returns empty string for empty input", () => {
    expect(utils.sanitizeWhatsAppNumber("")).toBe("");
  });

  test("does not modify non-Argentine international numbers", () => {
    expect(utils.sanitizeWhatsAppNumber("+12125550000")).toBe("12125550000");
  });

  test("handles malformed Argentine prefixes gracefully", () => {
    expect(utils.sanitizeWhatsAppNumber("54")).toBe("54");
    expect(utils.sanitizeWhatsAppNumber("+54abc")).toBe("54abc");
  });
});

// ── validatePhoneNumber ────────────────────────────────────────────────────────

describe("validatePhoneNumber", () => {
  test("accepts 10–13 digit strings with optional +", () => {
    expect(utils.validatePhoneNumber("+542230000000")).toBe(true);
    expect(utils.validatePhoneNumber("542230000000")).toBe(true);
    expect(utils.validatePhoneNumber("+549223000000")).toBe(true);
    expect(utils.validatePhoneNumber("1234567890")).toBe(true);
    expect(utils.validatePhoneNumber("1234567890123")).toBe(true);
  });

  test("rejects non-string types", () => {
    const err =
      "No parece un número de teléfono. Puede ser +542230000000 o +5492230000000. Sin espacios ni guiones.";
    expect(utils.validatePhoneNumber(undefined)).toBe(err);
    expect(utils.validatePhoneNumber(null)).toBe(err);
    expect(utils.validatePhoneNumber(542230000000)).toBe(err);
  });

  test("returns true for empty string (regex quirk — outer ? makes group optional)", () => {
    expect(utils.validatePhoneNumber("")).toBe(true);
  });

  test("rejects numbers with wrong length", () => {
    const err =
      "No parece un número de teléfono. Puede ser +542230000000 o +5492230000000. Sin espacios ni guiones.";
    expect(utils.validatePhoneNumber("123456789")).toBe(err);
    expect(utils.validatePhoneNumber("12345678901234")).toBe(err);
  });

  test("rejects numbers with spaces, dashes, or letters", () => {
    const err =
      "No parece un número de teléfono. Puede ser +542230000000 o +5492230000000. Sin espacios ni guiones.";
    expect(utils.validatePhoneNumber("+54 223 000 000")).toBe(err);
    expect(utils.validatePhoneNumber("+54-223-000-000")).toBe(err);
    expect(utils.validatePhoneNumber("+54223ABC000")).toBe(err);
  });

  test("rejects just a plus sign", () => {
    const err =
      "No parece un número de teléfono. Puede ser +542230000000 o +5492230000000. Sin espacios ni guiones.";
    expect(utils.validatePhoneNumber("+")).toBe(err);
  });
});

// ── generateWhatsappURL ────────────────────────────────────────────────────────

describe("generateWhatsappURL", () => {
  const products = [
    { name: "Comida", products: [{ amount: 2, name: "Ñoquis" }] },
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
      "+54223000000",
      "https://wa.me/549223000000?text=%C2%A1Hola!%20Quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA",
    ],
    [
      "+540223000000",
      "https://wa.me/549223000000?text=%C2%A1Hola!%20Quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA",
    ],
    [
      "+549223000000",
      "https://wa.me/549223000000?text=%C2%A1Hola!%20Quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA",
    ],
  ])(
    "sanitizes number and generates simple message: %s",
    (number, expected) => {
      expect(utils.generateWhatsappURL(number)).toBe(expected);
    },
  );

  test.each([
    [
      { name: "Ana", address: "Av. Siempre Viva 123", notes: null },
      "https://wa.me/549223000000?text=%C2%A1Hola!%20soy%20*Ana*%20y%20quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA%0A%0A%F0%9F%93%8D%20*Mi%20direcci%C3%B3n%3A*%20Av.%20Siempre%20Viva%20123%0A%0A*Mi%20pedido%3A*%0A*Comida*%0A%E2%9C%85%202%20x%20%C3%91oquis%0A*Bebidas*%0A%E2%9C%85%201%20x%20Caf%C3%A9%20%E2%98%95%0A%E2%9C%85%203%20x%20Agua",
    ],
    [
      { name: "Ana", address: "", notes: "Sin cebolla" },
      "https://wa.me/549223000000?text=%C2%A1Hola!%20soy%20*Ana*%20y%20quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA%0A%0A%F0%9F%93%9D%20*Notas%3A*%20Sin%20cebolla%0A%0A*Mi%20pedido%3A*%0A*Comida*%0A%E2%9C%85%202%20x%20%C3%91oquis%0A*Bebidas*%0A%E2%9C%85%201%20x%20Caf%C3%A9%20%E2%98%95%0A%E2%9C%85%203%20x%20Agua",
    ],
    [
      { name: "Ana", address: null, notes: undefined },
      "https://wa.me/549223000000?text=%C2%A1Hola!%20soy%20*Ana*%20y%20quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA%0A%0A%0A*Mi%20pedido%3A*%0A*Comida*%0A%E2%9C%85%202%20x%20%C3%91oquis%0A*Bebidas*%0A%E2%9C%85%201%20x%20Caf%C3%A9%20%E2%98%95%0A%E2%9C%85%203%20x%20Agua",
    ],
  ])("handles optional address/notes: %j", (userData, expected) => {
    expect(utils.generateWhatsappURL("+54223000000", userData, products)).toBe(
      expected,
    );
  });

  test("encodes Unicode and newlines while preserving order", () => {
    const userData = {
      name: "Ana ñandú",
      address: "Av. Siempre Viva 123",
      notes: "Sin cebolla\n¡Gracias!",
    };
    expect(utils.generateWhatsappURL("+54223000000", userData, products)).toBe(
      "https://wa.me/549223000000?text=%C2%A1Hola!%20soy%20*Ana%20%C3%B1and%C3%BA*%20y%20quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA%0A%0A%F0%9F%93%8D%20*Mi%20direcci%C3%B3n%3A*%20Av.%20Siempre%20Viva%20123%0A%F0%9F%93%9D%20*Notas%3A*%20Sin%20cebolla%0A%C2%A1Gracias!%0A%0A*Mi%20pedido%3A*%0A*Comida*%0A%E2%9C%85%202%20x%20%C3%91oquis%0A*Bebidas*%0A%E2%9C%85%201%20x%20Caf%C3%A9%20%E2%98%95%0A%E2%9C%85%203%20x%20Agua",
    );
  });

  test("preserves order emojis when the URL message is decoded", () => {
    const url = utils.generateWhatsappURL(
      "+54223000000",
      { name: "Ana", address: "Calle 123", notes: "Sin cebolla" },
      [{ name: "Comida", products: [{ amount: 1, name: "Empanada" }] }],
    );
    const decodedMessage = decodeURIComponent(url.split("?text=")[1]);

    expect(decodedMessage).toContain("💪");
    expect(decodedMessage).toContain("📍");
    expect(decodedMessage).toContain("📝");
    expect(decodedMessage).toContain("✅");
    expect(decodedMessage).not.toContain("�");
  });

  test("generates simple message when userData is undefined", () => {
    const url = utils.generateWhatsappURL("+54223000000");
    expect(url).toContain("wa.me/549223000000");
    expect(url).toContain(
      encodeURIComponent("¡Hola! Quiero hacer un pedido via HacerPedido 💪"),
    );
  });

  test("crashes when userData is null (typeof null !== 'undefined')", () => {
    expect(() =>
      utils.generateWhatsappURL("+54223000000", null, products),
    ).toThrow();
  });

  test("preserves non-Argentine number in URL", () => {
    expect(utils.generateWhatsappURL("+12125550000")).toContain(
      "wa.me/12125550000",
    );
  });

  test("handles empty products list", () => {
    const url = utils.generateWhatsappURL(
      "+54223000000",
      { name: "Ana", address: "Calle 123", notes: "" },
      [],
    );
    expect(url).toContain("wa.me/549223000000");
    expect(url).toContain(encodeURIComponent("*Mi pedido:*"));
  });

  test("generates URL with 'null' text for null number", () => {
    expect(utils.generateWhatsappURL(null)).toContain("wa.me/null");
  });
});
