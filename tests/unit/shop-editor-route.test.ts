import { saveShopWithProductsAction } from "#lib/actions/shop-editor";

import * as editorRouteModule from "../../app/api/shop/editor/route";

jest.mock("#lib/actions/shop-editor", () => ({
  saveShopWithProductsAction: jest.fn(),
}));

const mockSaveShop = jest.mocked(saveShopWithProductsAction);

class TestResponse {
  body: unknown;
  status: number;

  constructor(body: unknown, init: { status?: number } = {}) {
    this.body = body;
    this.status = init.status ?? 200;
  }

  static json(body: unknown, init?: { status?: number }): TestResponse {
    return new TestResponse(body, init);
  }

  async json(): Promise<unknown> {
    return this.body;
  }
}

if (!global.Response) {
  global.Response = TestResponse as unknown as typeof Response;
}

interface EditorRequest {
  json: () => Promise<unknown>;
}

// Route handlers are typed against the real Request/Response; the tests drive
// them with lightweight fakes, so the boundary is cast once.
const POST = editorRouteModule.POST as unknown as (
  request: EditorRequest,
) => Promise<TestResponse>;

function requestWithJson(value: unknown): EditorRequest {
  return { json: jest.fn().mockResolvedValue(value) };
}

describe("shop editor API route", () => {
  beforeEach(() => {
    mockSaveShop.mockReset();
  });

  test("returns validation errors from the editor action", async () => {
    const shop = { id: "shop-id", name: "", token: "editor-token" };
    mockSaveShop.mockResolvedValue({
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
    expect(mockSaveShop).toHaveBeenCalledWith(shop, [{ name: "Pan" }]);
  });

  test("saves a valid shop and returns the action result", async () => {
    const shop = {
      id: "shop-id",
      name: "Almacén",
      token: "editor-token",
      orderswhatsappnumber: "5491112345678",
    };
    const result = { message: "Tus cambios fueron guardados." };
    mockSaveShop.mockResolvedValue(result);

    const response = await POST(requestWithJson({ shop }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(result);
    expect(mockSaveShop).toHaveBeenCalledWith(shop, null);
  });

  test("converts action/database failures into an invalid-data response", async () => {
    mockSaveShop.mockRejectedValue(new Error("database down"));

    const response = await POST(requestWithJson({ shop: {} }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "Datos inválidos.",
      error: 1,
    });
    (console.error as jest.Mock).mockClear();
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
    (console.error as jest.Mock).mockClear();
  });
});
