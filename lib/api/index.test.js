const { ApiRequestError, getApiErrorMessage, requestJson } = require("./index");
const { saveShopWithProducts } = require("./shops");

describe("requestJson", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("serializes object bodies and only adds JSON content type for them", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    await requestJson("/api/test", {
      method: "POST",
      body: { name: "Comercio", enabled: true },
    });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.body).toBe(
      JSON.stringify({ name: "Comercio", enabled: true }),
    );
    expect(options.headers.get("Content-Type")).toBe("application/json");

    await requestJson("/api/test", { params: { category: "A B" } });
    const [, getOptions] = global.fetch.mock.calls[1];
    expect(global.fetch.mock.calls[1][0]).toBe("/api/test?category=A+B");
    expect(getOptions.headers.get("Content-Type")).toBeNull();
  });

  test("throws an inspectable error with status and decoded body", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 422,
      json: jest.fn().mockResolvedValue({ message: "Datos inválidos." }),
    });

    await expect(requestJson("/api/test")).rejects.toMatchObject({
      status: 422,
      data: { message: "Datos inválidos." },
    });
    await expect(requestJson("/api/test")).rejects.toBeInstanceOf(
      ApiRequestError,
    );

    const error = new ApiRequestError(400, { message: "No" });
    expect(getApiErrorMessage(error)).toBe("No");
    expect(getApiErrorMessage(new Error("No response"))).toBeUndefined();
  });
});

describe("saveShopWithProducts", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("keeps the legacy and editor request body variants", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({}),
    });
    const shopPatch = {
      id: 7,
      name: "Almacén",
      address: "Calle 1",
    };
    const products = [{ id: 3, name: "Pan", price: 100 }];

    await saveShopWithProducts("token", shopPatch, products);
    await saveShopWithProducts(
      "token",
      shopPatch,
      products,
      "/api/shop/editor",
    );

    const firstBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(firstBody).toMatchObject({ id: 7, token: "token", products });
    expect(firstBody.shop).toBeUndefined();

    const secondBody = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(secondBody).toEqual({
      shop: { ...shopPatch, token: "token" },
      products,
    });
  });

  test("includes a safe server message when saving fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 500,
      json: jest.fn().mockResolvedValue({ message: "No se pudo guardar" }),
    });

    const result = await saveShopWithProducts("token", { id: 7 }, []);

    expect(result).toEqual({
      message: expect.stringContaining("No se pudo guardar"),
      error: 1,
    });
  });
});
