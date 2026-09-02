import { saveShopWithProductsAction } from "#lib/actions/shop-editor";
import {
  getPublicShop,
  getPublicShops,
  getShopByToken,
} from "#lib/api/server-shops";

import * as slugRouteModule from "../../app/api/shop/[slug]/route";
import * as tokenRouteModule from "../../app/api/shop/by-token/route";
import * as homeRouteModule from "../../app/api/shop/home/route";

jest.mock("#lib/api/server-shops", () => ({
  getPublicShop: jest.fn(),
  getPublicShops: jest.fn(),
  getShopByToken: jest.fn(),
}));

jest.mock("#lib/actions/shop-editor", () => ({
  saveShopWithProductsAction: jest.fn(),
}));

const mockGetPublicShop = jest.mocked(getPublicShop);
const mockGetPublicShops = jest.mocked(getPublicShops);
const mockGetShopByToken = jest.mocked(getShopByToken);
const mockSaveShop = jest.mocked(saveShopWithProductsAction);

class TestResponse {
  body: unknown;
  status: number;
  headers: Map<string, string>;

  constructor(
    body: unknown,
    init: { status?: number; headers?: Record<string, string> } = {},
  ) {
    this.body = body;
    this.status = init.status ?? 200;
    this.headers = new Map(
      Object.entries(init.headers ?? {}).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ]),
    );
  }

  static json(
    body: unknown,
    init?: { status?: number; headers?: Record<string, string> },
  ): TestResponse {
    return new TestResponse(body, init);
  }

  async json(): Promise<unknown> {
    return this.body;
  }
}

if (!global.Response) {
  global.Response = TestResponse as unknown as typeof Response;
}

interface TestRequest {
  url: string;
  json: () => Promise<unknown>;
}

type RouteHandler = (
  request: TestRequest,
  context?: { params?: Promise<Record<string, string>> },
) => Promise<TestResponse>;

// Route handlers are typed against the real Request/Response; the tests drive
// them with lightweight fakes, so each boundary is cast once.
const publicShopRoute = {
  GET: slugRouteModule.GET as unknown as RouteHandler,
};
const tokenShopRoute = {
  GET: tokenRouteModule.GET as unknown as RouteHandler,
  POST: tokenRouteModule.POST as unknown as RouteHandler,
};
const homeRoute = {
  GET: homeRouteModule.GET as unknown as RouteHandler,
};

function request(
  path: string,
  init?: { body?: string; headers?: Record<string, string>; method?: string },
): TestRequest {
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
    expect(mockGetPublicShop).not.toHaveBeenCalled();
  });

  test("returns the public shop without editor secrets", async () => {
    mockGetPublicShop.mockResolvedValue({
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
    expect(mockGetPublicShop).toHaveBeenCalledWith("public-shop");
  });

  test("returns an empty result for an unknown slug", async () => {
    mockGetPublicShop.mockResolvedValue(null);

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
    mockGetShopByToken.mockResolvedValue(data);

    const response = await tokenShopRoute.GET(
      request("/api/shop/by-token?token=valid-token"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(data);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  test("returns 404 for an unknown token", async () => {
    mockGetShopByToken.mockResolvedValue(null);

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
    mockSaveShop.mockResolvedValue({
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
    expect(mockSaveShop).toHaveBeenCalledWith(body, body.products);
  });
});

describe("shop home API", () => {
  test("rejects an unknown category before querying the database", async () => {
    const response = await homeRoute.GET(
      request("/api/shop/home?category=Not%20a%20category"),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Wrong parameters (1)." });
    expect(mockGetPublicShops).not.toHaveBeenCalled();
  });

  test("returns public shops without editor secrets", async () => {
    mockGetPublicShops.mockResolvedValue([
      { slug: "public-shop", category: "Comida", typeformtoken: "secret" },
    ]);

    const response = await homeRoute.GET(
      request("/api/shop/home?category=Comida"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { slug: "public-shop", category: "Comida" },
    ]);
    expect(mockGetPublicShops).toHaveBeenCalledWith("Comida");
  });
});
