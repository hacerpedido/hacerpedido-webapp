let mockNestedResult;
let mockNestedQuery;

jest.mock("@sentry/nextjs", () => ({ withSentry: (handler) => handler }));
jest.mock("nested-knex", () => ({
  number: jest.fn(),
  string: jest.fn(),
  nullableString: jest.fn(),
  array: jest.fn(),
  type: jest.fn(() => ({
    withQuery: jest.fn((query) => {
      mockNestedQuery = query;
      return Promise.resolve(mockNestedResult);
    }),
  })),
}));

const shopBySlug = require("../../pages/api/shop/[slug]").default;
const shopByToken = require("../../pages/api/shop/by-token").default;
const shopHome = require("../../pages/api/shop/home").default;

function response() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    end: jest.fn(),
  };
}

beforeEach(() => {
  mockNestedResult = undefined;
  mockNestedQuery = undefined;
});

describe("public shop lookup API", () => {
  test("rejects a missing slug", async () => {
    const res = response();

    await shopBySlug({ query: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Wrong parameters (1)." });
  });

  test("returns the public shop and filters out non-public shops", async () => {
    const data = [{ slug: "public-shop", visibility: "public", products: [] }];
    mockNestedResult = data;
    const res = response();

    await shopBySlug({ query: { slug: "public-shop" } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(data);
    expect(mockNestedQuery.toSQL().sql).toContain('"visibility" = ?');
    expect(mockNestedQuery.toSQL().bindings).toContain("public");
  });

  test("returns an empty result for an unknown slug", async () => {
    mockNestedResult = [];
    const res = response();

    await shopBySlug({ query: { slug: "unknown-shop" } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

});

describe("token shop lookup API", () => {
  test("rejects a missing token", async () => {
    const res = response();

    await shopByToken({ method: "GET", query: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Wrong parameters (1)." });
  });

  test("returns a shop for a valid token, including private shops for the editor", async () => {
    const data = [{ slug: "private-shop", visibility: "private", products: [] }];
    mockNestedResult = data;
    const res = response();

    await shopByToken({ method: "GET", query: { token: "valid-token" } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test("returns 404 for an unknown token", async () => {
    mockNestedResult = [];
    const res = response();

    await shopByToken({ method: "GET", query: { token: "unknown-token" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No hay un comercio para ese token." });
  });

  test("rejects a POST without authorization token", async () => {
    const res = response();

    await shopByToken({ method: "POST", body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Wrong parameters (1)." });
  });
});

describe("shop home API", () => {
  test("rejects an unknown category before querying the database", async () => {
    const res = response();

    await shopHome({ query: { category: "Not a category" } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Wrong parameters (1)." });
  });
});
