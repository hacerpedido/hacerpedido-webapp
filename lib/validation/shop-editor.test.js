import { validateShopEditorInput } from "./shop-editor";

describe("validateShopEditorInput", () => {
  const validShop = {
    id: "shop-id",
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
        products: [{ name: "Pan", shopid: "other-shop" }],
      }),
    ).toBe("Producto asociado a otro comercio.");
  });

  it("accepts a valid shop and product payload", () => {
    expect(
      validateShopEditorInput({
        ...validShop,
        products: [{ name: "Pan", shopid: "shop-id", category: " almacén " }],
      }),
    ).toBeNull();
  });
});
