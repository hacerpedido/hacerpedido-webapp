import type { Product } from "../types";
import { ApiRequestError, getApiErrorMessage, requestJson } from "./index";
import { saveShopWithProducts } from "./shops";

function mockFetchResponse(status: number, body: unknown): jest.Mock {
  const fetchMock = jest.fn().mockResolvedValue({
    status,
    json: jest.fn().mockResolvedValue(body),
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe("requestJson", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("serializes object bodies and only adds JSON content type for them", async () => {
    const fetchMock = mockFetchResponse(200, { ok: true });

    await requestJson("/api/test", {
      method: "POST",
      body: { name: "Comercio", enabled: true },
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.body).toBe(
      JSON.stringify({ name: "Comercio", enabled: true }),
    );
    expect(options.headers.get("Content-Type")).toBe("application/json");

    await requestJson("/api/test", { params: { category: "A B" } });
    const [, getOptions] = fetchMock.mock.calls[1];
    expect(fetchMock.mock.calls[1][0]).toBe("/api/test?category=A+B");
    expect(getOptions.headers.get("Content-Type")).toBeNull();
  });

  test("throws an inspectable error with status and decoded body", async () => {
    mockFetchResponse(422, { message: "Datos inválidos." });

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
  type ShopPatch = Parameters<typeof saveShopWithProducts>[1];

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("keeps the legacy and editor request body variants", async () => {
    const fetchMock = mockFetchResponse(200, {});
    // Out-of-contract input: legacy shop records carried numeric ids, but the
    // request layer forwards the body as-is, so the payload shape is untyped.
    const shopPatch = {
      id: 7,
      name: "Almacén",
      address: "Calle 1",
    } as unknown as ShopPatch;
    // Out-of-contract input: legacy product payloads carried numeric ids and
    // numeric prices; the request layer forwards them as-is.
    const products = [
      { id: 3, name: "Pan", price: 100 },
    ] as unknown as Product[];

    await saveShopWithProducts("token", shopPatch, products);
    await saveShopWithProducts(
      "token",
      shopPatch,
      products,
      "/api/shop/editor",
    );

    const firstBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(firstBody).toMatchObject({ id: 7, token: "token", products });
    expect(firstBody.shop).toBeUndefined();

    const secondBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(secondBody).toEqual({
      shop: { ...shopPatch, token: "token" },
      products,
    });
  });

  test("includes a safe server message when saving fails", async () => {
    mockFetchResponse(500, { message: "No se pudo guardar" });

    const result = await saveShopWithProducts(
      "token",
      { id: 7 } as unknown as ShopPatch,
      [],
    );

    expect(result).toEqual({
      message: expect.stringContaining("No se pudo guardar"),
      error: 1,
    });
  });
});
