import { sanitizePrice, sanitizeAddress, sanitizeProductName, sanitizeWhatsAppNumber } from "./utils";

describe("SanitizePrice", () => {
  test("remove spaces from prices", () => {
    expect(sanitizePrice("   100   ")).toBe(100);
  });
  test("remove $ from prices", () => {
    expect(sanitizePrice("$1")).toBe(1);
  });
  test("remove ,00 from prices", () => {
    expect(sanitizePrice("1,00")).toBe(1);
  });
  test("remove .00 from prices", () => {
    expect(sanitizePrice("1.00")).toBe(1);
  });
  test("remove . thousand separators from prices", () => {
    expect(sanitizePrice("1,000")).toBe(1000);
  });
});

describe("SanitizeAddress", () => {
  test("remove spaces from address", () => {
    expect(sanitizeAddress("  ALGO   ")).toBe("Algo");
  });
  test("remove NO from address", () => {
    expect(sanitizeAddress("NO")).toBe("");
  });
  test("remove no from address", () => {
    expect(sanitizeAddress("no")).toBe("");
  });
  test("ignore null address", () => {
    expect(sanitizeAddress()).toBe("");
  });
});

describe("sanitizeWhatsAppNumber", () => {
  test("add 9 and remove + to WhatsAppNumber", () => {
    expect(sanitizeWhatsAppNumber("+54223000000")).toBe("549223000000");
  });
  test("remove 0 from WhatsAppNumber if needed", () => {
    expect(sanitizeWhatsAppNumber("+540223000000")).toBe("549223000000");
  });
});

describe("sanitizeProductName", () => {
  test("capitalize all uppercase name", () => {
    expect(sanitizeProductName("PRODUCT NAME")).toBe("Product Name");
  });
  test("capitalize first letter and ignore rest if the name has mixed caps", () => {
    expect(sanitizeProductName("product NAME")).toBe("Product NAME");
  });
});
