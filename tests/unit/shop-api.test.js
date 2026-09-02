jest.mock("#lib/api/server-shops", () => ({
  getPublicShop: jest.fn(),
  getPublicShops: jest.fn(),
  getShopByToken: jest.fn(),
}));

jest.mock("#lib/actions/shop-editor", () => ({
  saveShopWithProductsAction: jest.fn(),
}));

if (!global.Response) {
  global.Response = class TestResponse {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status ?? 200;
      this.headers = new Map(
        Object.entries(init.headers ?? {}).map(([key, value]) => [
          key.toLowerCase(),
          value,
        ]),
      );
    }

    static json(body, init) {
      return new TestResponse(body, init);
    }

    async json() {
      return this.body;
    }
  };
}

const publicShopRoute = require("../../app/api/shop/[slug]/route");
const tokenShopRoute = require("../../app/api/shop/by-token/route");
const homeRoute = require("../../app/api/shop/home/route");
const {
  getPublicShop,
  getPublicShops,
  getShopByToken,
} = require("#lib/api/server-shops");
const { saveShopWithProductsAction } = require("#lib/actions/shop-editor");

function request(path, init) {
  const body = init?.body;
  return {
    url: `http://localhost${path}`,
    json: jest.fn().mockResolvedValue(body ? JSON.parse(body) : {}),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("public shop lookup API", () => {
  test("rejects a missing slug", async () => {
    const response = await publicShopRoute.GET(request("/api/shop/"), {
      params: Promise.resolve({ slug: "" }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Wrong parameters (1)." });
    expect(getPublicShop).not.toHaveBeenCalled();
  });

  test("returns the public shop without editor secrets", async () => {
    getPublicShop.mockResolvedValue({
      slug: "public-shop",
      visibility: "public",
      typeformtoken: "editor-secret",
      products: [],
    });

    const response = await publicShopRoute.GET(
      request("/api/shop/public-shop"),
      { params: Promise.resolve({ slug: "public-shop" }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { slug: "public-shop", visibility: "public", products: [] },
    ]);
    expect(getPublicShop).toHaveBeenCalledWith("public-shop");
  });

  test("returns an empty result for an unknown slug", async () => {
    getPublicShop.mockResolvedValue(null);

    const response = await publicShopRoute.GET(
      request("/api/shop/unknown-shop"),
      { params: Promise.resolve({ slug: "unknown-shop" }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });
});

describe("token shop lookup API", () => {
  test("rejects a missing token", async () => {
    const response = await tokenShopRoute.GET(request("/api/shop/by-token"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Wrong parameters (1)." });
  });

  test("returns a shop for a valid token, including private shops", async () => {
    const data = {
      slug: "private-shop",
      visibility: "private",
      typeformtoken: "valid-token",
      products: [],
    };
    getShopByToken.mockResolvedValue(data);

    const response = await tokenShopRoute.GET(
      request("/api/shop/by-token?token=valid-token"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(data);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  test("returns 404 for an unknown token", async () => {
    getShopByToken.mockResolvedValue(null);

    const response = await tokenShopRoute.GET(
      request("/api/shop/by-token?token=unknown-token"),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "No hay un comercio para ese token.",
    });
  });

  test("rejects a POST without authorization token", async () => {
    const response = await tokenShopRoute.POST(
      request("/api/shop/by-token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Wrong parameters (1)." });
  });

  test("keeps the legacy POST success response", async () => {
    const body = {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Almacén",
      token: "editor-token",
      orderswhatsappnumber: "5491112345678",
      products: [{ name: "Pan" }],
    };
    saveShopWithProductsAction.mockResolvedValue({
      message: "Tus cambios fueron guardados.",
    });

    const response = await tokenShopRoute.POST(
      request("/api/shop/by-token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      message: "Tus cambios fueron guardados.",
    });
    expect(saveShopWithProductsAction).toHaveBeenCalledWith(
      body,
      body.products,
    );
  });
});

describe("shop home API", () => {
  test("rejects an unknown category before querying the database", async () => {
    const response = await homeRoute.GET(
      request("/api/shop/home?category=Not%20a%20category"),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Wrong parameters (1)." });
    expect(getPublicShops).not.toHaveBeenCalled();
  });

  test("returns public shops without editor secrets", async () => {
    getPublicShops.mockResolvedValue([
      { slug: "public-shop", category: "Comida", typeformtoken: "secret" },
    ]);

    const response = await homeRoute.GET(
      request("/api/shop/home?category=Comida"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { slug: "public-shop", category: "Comida" },
    ]);
    expect(getPublicShops).toHaveBeenCalledWith("Comida");
  });
});
