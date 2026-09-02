import * as products from "./products";

const basicList = [
  { category: "a", name: "nameA" },
  { category: "a", name: "nameB" },
  { category: "b", name: "nameC" },
  { category: "b", name: "nameD" },
  { category: "b", name: "nameE" },
  { category: "c", name: "nameF" },
];

// ── extractSections ────────────────────────────────────────────────────────────

describe("extractSections", () => {
  test("handle undefined", () => {
    expect(products.extractSections()).toEqual([]);
  });

  // This existing test was a no-op — keeping it for backward compat
  test("handle empty list", () => {
    expect([]).toEqual([]);
  });

  test("handle one section with one product", () => {
    const result = products.extractSections([{ category: "a", name: "A" }]);
    expect(result).toHaveLength(1);
    expect(result[0].products).toHaveLength(1);
  });

  test("handle one section with two products", () => {
    const result = products.extractSections([
      { category: "a", name: "A" },
      { category: "a", name: "B" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].products).toHaveLength(2);
  });

  test("return multiple sections", () => {
    const result = products.extractSections(basicList);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe("a");
    expect(result[1].name).toBe("b");
    expect(result[2].name).toBe("c");
    expect(result[0].products).toHaveLength(2);
    expect(result[1].products).toHaveLength(3);
    expect(result[2].products).toHaveLength(1);
  });

  // Invalid input is rejected because the function expects an array.
  test("throws for null input", () => {
    expect(() => products.extractSections(null)).toThrow();
  });

  // Edge: empty array
  test("returns empty array for []", () => {
    expect(products.extractSections([])).toEqual([]);
  });

  // Edge: products without category field
  test("handles products with undefined category", () => {
    const result = products.extractSections([{ name: "A" }, { name: "B" }]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe(undefined);
    expect(result[0].products).toHaveLength(2);
  });

  // Edge: products with null category
  test("handles products with null category", () => {
    const result = products.extractSections([
      { category: null, name: "A" },
      { category: null, name: "B" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe(null);
    expect(result[0].products).toHaveLength(2);
  });

  // Edge: interleaved categories (a, b, a) — creates 3 sections
  test("creates separate sections for interleaved categories", () => {
    const input = [
      { category: "a", name: "A1" },
      { category: "b", name: "B1" },
      { category: "a", name: "A2" },
    ];
    const result = products.extractSections(input);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe("a");
    expect(result[1].name).toBe("b");
    expect(result[2].name).toBe("a");
    expect(result[0].products).toHaveLength(1);
    expect(result[1].products).toHaveLength(1);
    expect(result[2].products).toHaveLength(1);
  });

  // Edge: products with extra fields are preserved
  test("preserves extra fields in products", () => {
    const input = [
      { category: "a", name: "X", price: "$10", description: "desc" },
    ];
    const result = products.extractSections(input);
    expect(result[0].products[0]).toEqual({
      category: "a",
      name: "X",
      price: "$10",
      description: "desc",
    });
  });
});

// ── productForGrid ─────────────────────────────────────────────────────────────

describe("productForGrid", () => {
  test("returns empty array for null", () => {
    expect(products.productForGrid(null)).toEqual([]);
  });

  test("returns empty array for undefined", () => {
    expect(products.productForGrid(undefined)).toEqual([]);
  });

  test("returns empty array for empty array", () => {
    expect(products.productForGrid([])).toEqual([]);
  });

  test("generates category separator rows for a single product", () => {
    const input = [
      { category: "a", name: "A", description: "desc", price: "10" },
    ];
    const result = products.productForGrid(input);
    // [false, "", "", ""]
    // [true, "a", "", ""]
    // [false, "", "", ""]
    // [false, "A", "desc", "10"]
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual([false, "", "", ""]);
    expect(result[1]).toEqual([true, "a", "", ""]);
    expect(result[2]).toEqual([false, "", "", ""]);
    expect(result[3]).toEqual([false, "A", "desc", "10"]);
  });

  test("groups products under their category", () => {
    const input = [
      { category: "a", name: "A1", description: "", price: "" },
      { category: "a", name: "A2", description: "", price: "" },
    ];
    const result = products.productForGrid(input);
    expect(result).toHaveLength(5); // category header (3) + 2 products
    expect(result[3]).toEqual([false, "A1", "", ""]);
    expect(result[4]).toEqual([false, "A2", "", ""]);
  });

  test("emits new category header when category changes", () => {
    const input = [
      { category: "a", name: "A1", description: "", price: "" },
      { category: "b", name: "B1", description: "", price: "" },
    ];
    const result = products.productForGrid(input);
    // Expect: a header (3) + A1 + b header (3) + B1 = 8 rows
    expect(result).toHaveLength(8);
    expect(result[3]).toEqual([false, "A1", "", ""]);
    expect(result[7]).toEqual([false, "B1", "", ""]);
  });

  // Edge: products without all fields
  test("handles products with missing fields", () => {
    const input = [{ category: "a" }];
    const result = products.productForGrid(input);
    // The product row will be [false, undefined, undefined, undefined]
    expect(result[3]).toEqual([false, undefined, undefined, undefined]);
  });

  // Edge: same category listed twice non-contiguously
  test("re-emits category header for non-contiguous same category", () => {
    const input = [
      { category: "a", name: "A1", description: "", price: "" },
      { category: "b", name: "B1", description: "", price: "" },
      { category: "a", name: "A2", description: "", price: "" },
    ];
    const result = products.productForGrid(input);
    // 3 header rows per category + 1 product row per product = 3*3 + 3 = 12
    expect(result).toHaveLength(12);
    // Second "a" header at row 9 (after: a-header + A1 + b-header + B1 = 8 rows)
    expect(result[9]).toEqual([true, "a", "", ""]);
  });
});

// ── productsFromGrid ───────────────────────────────────────────────────────────

describe("productsFromGrid", () => {
  test("returns empty array for null rows", () => {
    expect(products.productsFromGrid("shop-1", null)).toEqual([]);
  });

  test("returns empty array for undefined rows", () => {
    expect(products.productsFromGrid("shop-1", undefined)).toEqual([]);
  });

  test("returns empty array for empty rows", () => {
    expect(products.productsFromGrid("shop-1", [])).toEqual([]);
  });

  test("parses a category row followed by product rows", () => {
    const rows = [
      [false, "", "", ""],
      [true, "Comida", "", ""],
      [false, "", "", ""],
      [false, "Ñoquis", "Ñoquis de espinaca", "$150"],
    ];
    const result = products.productsFromGrid("shop-1", rows);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "Ñoquis",
      price: "150",
      description: "Ñoquis de espinaca",
      category: "Comida",
      shopid: "shop-1",
      itemnumber: 1,
    });
  });

  test("assigns sequential item numbers", () => {
    const rows = [
      [false, "", "", ""],
      [true, "Bebidas", "", ""],
      [false, "", "", ""],
      [false, "Café", "", "$100"],
      [false, "Agua", "", "$50"],
    ];
    const result = products.productsFromGrid("shop-1", rows);
    expect(result[0].itemnumber).toBe(1);
    expect(result[1].itemnumber).toBe(2);
  });

  test("skips rows with null name", () => {
    const rows = [
      [false, "", "", ""],
      [true, "Bebidas", "", ""],
      [false, "", "", ""],
      [false, null, "", "$100"],
      [false, "Café", "", "$100"],
    ];
    const result = products.productsFromGrid("shop-1", rows);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Café");
  });

  test("skips rows with empty name", () => {
    const rows = [
      [false, "", "", ""],
      [true, "Bebidas", "", ""],
      [false, "", "", ""],
      [false, "", "", "$100"],
      [false, "Café", "", "$100"],
    ];
    const result = products.productsFromGrid("shop-1", rows);
    expect(result).toHaveLength(1);
  });

  // Edge: price is null or missing
  test("sets empty string for null price", () => {
    const rows = [
      [false, "", "", ""],
      [true, "Comida", "", ""],
      [false, "", "", ""],
      [false, "Ñoquis", null, null],
    ];
    const result = products.productsFromGrid("shop-1", rows);
    expect(result[0].price).toBe("");
  });

  // Edge: no description
  test("omits description when it is null", () => {
    const rows = [
      [false, "", "", ""],
      [true, "Comida", "", ""],
      [false, "", "", ""],
      [false, "Ñoquis", null, "$100"],
    ];
    const result = products.productsFromGrid("shop-1", rows);
    expect(result[0].description).toBeUndefined();
  });

  test("omits description when it is empty string", () => {
    const rows = [
      [false, "", "", ""],
      [true, "Comida", "", ""],
      [false, "", "", ""],
      [false, "Ñoquis", "", "$100"],
    ];
    const result = products.productsFromGrid("shop-1", rows);
    expect(result[0].description).toBeUndefined();
  });

  // Edge: shopID as a number is normalized to the string contract.
  test("normalizes numeric shopID", () => {
    const rows = [
      [false, "", "", ""],
      [true, "Comida", "", ""],
      [false, "", "", ""],
      [false, "Ñoquis", "", "$150"],
    ];
    const result = products.productsFromGrid(42, rows);
    expect(result[0].shopid).toBe("42");
  });

  // Edge: category is title-cased by toTitleCase
  test("title-cases the category name", () => {
    const rows = [
      [false, "", "", ""],
      [true, "comida caliente", "", ""],
      [false, "", "", ""],
      [false, "Ñoquis", "", "$100"],
    ];
    const result = products.productsFromGrid("shop-1", rows);
    expect(result[0].category).toBe("Comida Caliente");
  });

  // Edge: multiple categories
  test("tracks category changes across multiple sections", () => {
    const rows = [
      [false, "", "", ""],
      [true, "Comida", "", ""],
      [false, "", "", ""],
      [false, "Ñoquis", "", "$150"],
      [false, "", "", ""],
      [true, "Bebidas", "", ""],
      [false, "", "", ""],
      [false, "Café", "", "$100"],
    ];
    const result = products.productsFromGrid("shop-1", rows);
    expect(result).toHaveLength(2);
    expect(result[0].category).toBe("Comida");
    expect(result[1].category).toBe("Bebidas");
  });
});
