import {
  getBackgroundForShop,
  getLogoForShop,
  getShopInitials,
  getShopInitialsColor,
} from "./shops";

describe("getLogoForShop", () => {
  test("returns null when the shop has no logo", () => {
    expect(getLogoForShop({ logo: null })).toBeNull();
    expect(getLogoForShop({ logo: "   " })).toBeNull();
  });

  test("keeps local paths unchanged", () => {
    expect(getLogoForShop({ logo: "/images/logos/shop.jpg" })).toBe(
      "/images/logos/shop.jpg",
    );
  });

  test("keeps external URLs unchanged", () => {
    expect(getLogoForShop({ logo: "https://example.com/shop.jpg" })).toBe(
      "https://example.com/shop.jpg",
    );
  });

  test("builds the bucket URL for stored filenames", () => {
    process.env.NEXT_PUBLIC_IMAGE_BUCKET_URL = "https://images.example.com";

    expect(getLogoForShop({ logo: "uploads/shop.jpg" })).toBe(
      "https://images.example.com/shop.jpg",
    );
  });
});

describe("getShopInitials", () => {
  test("returns up to two initials", () => {
    expect(getShopInitials("Cafetería 2")).toBe("C2");
    expect(getShopInitials("Panadería Central Norte")).toBe("PC");
  });

  test("returns a placeholder for an empty name", () => {
    expect(getShopInitials("  ")).toBe("?");
  });
});

describe("getShopInitialsColor", () => {
  test("returns a stable color for the same shop", () => {
    expect(getShopInitialsColor("Cafetería 2")).toBe(
      getShopInitialsColor("Cafetería 2"),
    );
  });

  test("returns a color from the initials palette", () => {
    const palette = [
      "#D45D5D",
      "#D4934A",
      "#4D9A78",
      "#4C7FB3",
      "#8B6BB1",
      "#B56B91",
    ];

    expect(palette).toContain(getShopInitialsColor("Cafetería 2"));
  });
});

describe("getBackgroundForShop", () => {
  test("uses the category background when no custom background exists", () => {
    expect(
      getBackgroundForShop({ background: null, category: "Cafetería" }),
    ).toBe("url(/images/backgrounds/cafe.jpg)");
  });
});
