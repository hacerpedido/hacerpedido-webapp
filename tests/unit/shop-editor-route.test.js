jest.mock("#lib/actions/shop-editor", () => ({
  saveShopWithProductsAction: jest.fn(),
}));

if (!global.Response) {
  global.Response = class TestResponse {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status ?? 200;
    }

    static json(body, init) {
      return new TestResponse(body, init);
    }

    async json() {
      return this.body;
    }
  };
}

const { POST } = require("../../app/api/shop/editor/route");
const { saveShopWithProductsAction } = require("#lib/actions/shop-editor");

function requestWithJson(value) {
  return { json: jest.fn().mockResolvedValue(value) };
}

describe("shop editor API route", () => {
  beforeEach(() => {
    saveShopWithProductsAction.mockReset();
  });

  test("returns validation errors from the editor action", async () => {
    const shop = { id: "shop-id", name: "", token: "editor-token" };
    saveShopWithProductsAction.mockResolvedValue({
      message: "El nombre del comercio es requerido.",
      error: 1,
    });

    const response = await POST(
      requestWithJson({ shop, products: [{ name: "Pan" }] }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "El nombre del comercio es requerido.",
      error: 1,
    });
    expect(saveShopWithProductsAction).toHaveBeenCalledWith(shop, [
      { name: "Pan" },
    ]);
  });

  test("saves a valid shop and returns the action result", async () => {
    const shop = {
      id: "shop-id",
      name: "Almacén",
      token: "editor-token",
      orderswhatsappnumber: "5491112345678",
    };
    const result = { message: "Tus cambios fueron guardados." };
    saveShopWithProductsAction.mockResolvedValue(result);

    const response = await POST(requestWithJson({ shop }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(result);
    expect(saveShopWithProductsAction).toHaveBeenCalledWith(shop, null);
  });

  test("converts action/database failures into an invalid-data response", async () => {
    saveShopWithProductsAction.mockRejectedValue(new Error("database down"));

    const response = await POST(requestWithJson({ shop: {} }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "Datos inválidos.",
      error: 1,
    });
    console.error.mockClear();
  });

  test("returns an invalid-data response when the request body is malformed", async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new SyntaxError("bad JSON")),
    };

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "Datos inválidos.",
      error: 1,
    });
    console.error.mockClear();
  });
});
