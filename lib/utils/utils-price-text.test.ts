import * as utils from "./utils";

// ── sanitizePrice ──────────────────────────────────────────────────────────────

describe("sanitizePrice", () => {
  test("remove spaces and $ from prices", () => {
    expect(utils.sanitizePrice("   100   ")).toBe(100);
    expect(utils.sanitizePrice("$1")).toBe(1);
  });

  test("remove trailing ,00 or .00", () => {
    expect(utils.sanitizePrice("1,00")).toBe(1);
    expect(utils.sanitizePrice("1.00")).toBe(1);
  });

  test("remove . thousand separators", () => {
    expect(utils.sanitizePrice("1,000")).toBe(1000);
  });

  test("non-string inputs pass through", () => {
    expect(utils.sanitizePrice(null)).toBe(null);
    expect(utils.sanitizePrice(undefined)).toBe(undefined);
    expect(utils.sanitizePrice(42)).toBe(42);
    expect(utils.sanitizePrice(0)).toBe(0);
  });

  test("returns empty string for empty or non-numeric input", () => {
    expect(utils.sanitizePrice("")).toBe("");
    expect(utils.sanitizePrice("abc")).toBe("");
  });

  test("parses $0 correctly", () => {
    expect(utils.sanitizePrice("$0")).toBe(0);
  });

  test("handles Argentine format 1.500,00", () => {
    expect(utils.sanitizePrice("1.500,00")).toBe(1500);
  });

  test("handles negative price", () => {
    expect(utils.sanitizePrice("-$50")).toBe(-50);
  });

  test("handles 10,000 as ten thousand", () => {
    expect(utils.sanitizePrice("10,000")).toBe(10000);
  });

  test("handles decimal with comma as truncation", () => {
    // parseFloat stops at the comma
    expect(utils.sanitizePrice("10,50")).toBe(10);
  });

  test("handles 1.234.567", () => {
    expect(utils.sanitizePrice("1.234.567")).toBe(1234.567);
  });
});

// ── sanitizeAddress ────────────────────────────────────────────────────────────

describe("sanitizeAddress", () => {
  test("trims, removes 'no' patterns, applies title case", () => {
    expect(utils.sanitizeAddress("  ALGO   ")).toBe("Algo");
    expect(utils.sanitizeAddress("AV. SIEMPRE VIVA 123")).toBe(
      "Av. Siempre Viva 123",
    );
  });

  test("removes standalone NO/no", () => {
    expect(utils.sanitizeAddress("NO")).toBe("");
    expect(utils.sanitizeAddress("no")).toBe("");
    expect(utils.sanitizeAddress("nO")).toBe("");
    expect(utils.sanitizeAddress("No")).toBe("");
  });

  test("removes 'no' substring from within address", () => {
    expect(utils.sanitizeAddress("Calle NO 123")).toBe("Calle  123");
  });

  test("non-string inputs return empty string", () => {
    expect(utils.sanitizeAddress(undefined)).toBe("");
    expect(utils.sanitizeAddress(null)).toBe("");
    expect(utils.sanitizeAddress(123)).toBe("");
    expect(utils.sanitizeAddress({})).toBe("");
  });

  test("returns empty for empty or whitespace-only string", () => {
    expect(utils.sanitizeAddress("")).toBe("");
    expect(utils.sanitizeAddress("   ")).toBe("");
  });
});

// ── toTitleCase ────────────────────────────────────────────────────────────────

describe("toTitleCase", () => {
  test("non-string inputs return empty string", () => {
    expect(utils.toTitleCase(null)).toBe("");
    expect(utils.toTitleCase(undefined)).toBe("");
    expect(utils.toTitleCase(42)).toBe("");
    expect(utils.toTitleCase({})).toBe("");
  });

  test("returns empty for empty string", () => {
    expect(utils.toTitleCase("")).toBe("");
  });

  test("capitalizes first letter of each word", () => {
    expect(utils.toTitleCase("hello world")).toBe("Hello World");
    expect(utils.toTitleCase("HELLO WORLD")).toBe("Hello World");
    expect(utils.toTitleCase("hElLo WoRlD")).toBe("Hello World");
  });

  test("handles single character", () => {
    expect(utils.toTitleCase("a")).toBe("A");
  });

  test("handles string with numbers", () => {
    expect(utils.toTitleCase("av 123 siempre viva")).toBe(
      "Av 123 Siempre Viva",
    );
  });
});

// ── capitalize ─────────────────────────────────────────────────────────────────

describe("capitalize", () => {
  test("non-string inputs return empty string", () => {
    expect(utils.capitalize(null)).toBe("");
    expect(utils.capitalize(undefined)).toBe("");
    expect(utils.capitalize(42)).toBe("");
  });

  test("capitalizes first letter, preserves rest", () => {
    expect(utils.capitalize("hello")).toBe("Hello");
    expect(utils.capitalize("hELLO")).toBe("HELLO");
  });

  test("handles single character and empty string", () => {
    expect(utils.capitalize("a")).toBe("A");
    expect(utils.capitalize("")).toBe("");
  });
});

// ── sanitizeProductName ────────────────────────────────────────────────────────

describe("sanitizeProductName", () => {
  test("applies title case to ALLCAPS names", () => {
    expect(utils.sanitizeProductName("PRODUCT NAME")).toBe("Product Name");
  });

  test("applies capitalize (not title case) to mixed/lowercase names", () => {
    expect(utils.sanitizeProductName("product NAME")).toBe("Product NAME");
    expect(utils.sanitizeProductName("product name")).toBe("Product name");
  });

  test("non-string inputs pass through", () => {
    expect(utils.sanitizeProductName(null)).toBe(null);
    expect(utils.sanitizeProductName(undefined)).toBe(undefined);
    expect(utils.sanitizeProductName(42)).toBe(42);
  });

  test("handles empty string and single characters", () => {
    expect(utils.sanitizeProductName("")).toBe("");
    expect(utils.sanitizeProductName("A")).toBe("A");
    expect(utils.sanitizeProductName("a")).toBe("A");
  });
});

// ── removeEmptyStringElements ──────────────────────────────────────────────────

describe("removeEmptyStringElements", () => {
  test("removes empty string values, keeps others", () => {
    const input = { a: "", b: "hello", c: null, d: undefined, e: 0 };
    expect(utils.removeEmptyStringElements(input)).toEqual({
      b: "hello",
      c: null,
      d: undefined,
      e: 0,
    });
  });

  test("removes nested empty string values", () => {
    expect(utils.removeEmptyStringElements({ a: { b: "" } })).toEqual({
      a: {},
    });
  });

  test("handles empty object", () => {
    expect(utils.removeEmptyStringElements({})).toEqual({});
  });
});

// ── trimObject ─────────────────────────────────────────────────────────────────

describe("trimObject", () => {
  test("trims string values, leaves non-strings untouched", () => {
    const input = { a: "  hello  ", b: null, c: 42 };
    const result = utils.trimObject(input);
    expect(result).toEqual({ a: "hello", b: null, c: 42 });
  });

  test("handles empty object", () => {
    expect(utils.trimObject({})).toEqual({});
  });
});

// ── sleep ──────────────────────────────────────────────────────────────────────

describe("sleep", () => {
  test("resolves after the given ms", async () => {
    const start = Date.now();
    await utils.sleep(10);
    expect(Date.now() - start).toBeGreaterThanOrEqual(5);
  });
});

// ── randomString ───────────────────────────────────────────────────────────────

describe("randomString", () => {
  test("returns string of requested length", () => {
    expect(utils.randomString(10)).toHaveLength(10);
    expect(utils.randomString(0)).toBe("");
  });

  test("uses given character set", () => {
    expect(utils.randomString(100)).toMatch(/^[a-z0-9]+$/);
    expect(utils.randomString(10, "ABC")).toMatch(/^[ABC]+$/);
  });

  test("returns different values on successive calls", () => {
    expect(utils.randomString(20)).not.toBe(utils.randomString(20));
  });
});

// ── generateCallUrl ────────────────────────────────────────────────────────────

describe("generateCallUrl", () => {
  test("generates tel link with encoded number", () => {
    expect(utils.generateCallUrl("+54 223 000 000")).toBe(
      "tel: %2B54%20223%20000%20000",
    );
  });

  test("handles empty string", () => {
    expect(utils.generateCallUrl("")).toBe("tel: ");
  });
});
