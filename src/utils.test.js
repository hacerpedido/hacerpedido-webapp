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

// Test sanitizeProductName
test("capitalize all uppercase name", () => {
  expect(utils.sanitizeProductName("PRODUCT NAME")).toBe("Product Name");
});
test("capitalize first letter and ignore rest if the name has mixed caps", () => {
  expect(utils.sanitizeProductName("product NAME")).toBe("Product NAME");
});
