import { validateShopEditorInput } from "./shop-editor";

describe("validateShopEditorInput", () => {
  const shopId = "11111111-1111-4111-8111-111111111111";
  const otherShopId = "22222222-2222-4222-8222-222222222222";
  const validShop = {
    id: shopId,
    token: "editor-token",
    name: "Almacén",
    orderswhatsappnumber: "5491112345678",
  };

  it("requires a token, name, and contact number", () => {
    expect(validateShopEditorInput({})).toBe("Token inválido.");
    expect(validateShopEditorInput({ ...validShop, token: "" })).toBe(
      "Token inválido.",
    );
    expect(
      validateShopEditorInput({ ...validShop, orderswhatsappnumber: "" }),
    ).toBe("Al menos un número de teléfono debe ser ingresado.");
  });

  it("rejects products belonging to another shop", () => {
    expect(
      validateShopEditorInput({
        ...validShop,
        products: [{ name: "Pan", shopid: otherShopId }],
      }),
    ).toBe("Producto asociado a otro comercio.");
  });

  it.each([
    ["shop", { ...validShop, id: "not-a-uuid" }, "Comercio inválido."],
    [
      "product",
      { ...validShop, products: [{ id: "not-a-uuid", name: "Pan" }] },
      "Productos inválidos.",
    ],
    [
      "product shop",
      { ...validShop, products: [{ name: "Pan", shopid: "not-a-uuid" }] },
      "Productos inválidos.",
    ],
  ])("rejects malformed %s IDs", (_label, input, expected) => {
    expect(validateShopEditorInput(input)).toBe(expected);
  });

  it("accepts a valid shop and product payload", () => {
    expect(
      validateShopEditorInput({
        ...validShop,
        products: [{ name: "Pan", shopid: shopId, category: " almacén " }],
      }),
    ).toBeNull();
  });

  it("accepts valid UUID product IDs and case differences", () => {
    expect(
      validateShopEditorInput({
        ...validShop,
        products: [
          {
            id: "33333333-3333-4333-8333-333333333333",
            name: "Pan",
            shopid: shopId.toUpperCase(),
          },
        ],
      }),
    ).toBeNull();
  });
});
