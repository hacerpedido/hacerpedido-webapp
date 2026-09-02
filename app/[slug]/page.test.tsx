import {
  getDevelopmentShopEditToken,
  getPublicShop,
} from "#lib/api/server-shops";

import PublicShopPage from "./page";

jest.mock("#components/Shop/ShopFooter", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("#components/Shop/ShopView", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("#lib/api/server-shops", () => ({
  getDevelopmentShopEditToken: jest.fn(),
  getPublicShop: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

const mockGetDevelopmentShopEditToken = jest.mocked(
  getDevelopmentShopEditToken,
);
const mockGetPublicShop = jest.mocked(getPublicShop);

const publicShop = { slug: "public-shop", products: [] };
const originalNodeEnv = process.env.NODE_ENV;

// Next.js types mark NODE_ENV as read-only; tests still need to flip it.
function setNodeEnv(value: string | undefined): void {
  (process.env as { NODE_ENV?: string }).NODE_ENV = value;
}

interface RenderedPage {
  props: { children: Array<{ props: Record<string, unknown> }> };
}

async function renderPublicShopPage(): Promise<RenderedPage> {
  const page = await PublicShopPage({
    params: Promise.resolve({ slug: publicShop.slug }),
  });
  return page as unknown as RenderedPage;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPublicShop.mockResolvedValue(publicShop);
});

afterEach(() => {
  setNodeEnv(originalNodeEnv);
});

describe("public shop development editor link data", () => {
  test("loads and passes the editor token only in development", async () => {
    setNodeEnv("development");
    mockGetDevelopmentShopEditToken.mockResolvedValue("development-token");

    const page = await renderPublicShopPage();

    expect(mockGetDevelopmentShopEditToken).toHaveBeenCalledWith(
      publicShop.slug,
    );
    expect(page.props.children[0].props).toEqual({
      shop: publicShop,
      editToken: "development-token",
    });
  });

  test.each(["test", "production"])(
    "does not pass editor token in %s",
    async (nodeEnv) => {
      setNodeEnv(nodeEnv);

      const page = await renderPublicShopPage();

      expect(mockGetDevelopmentShopEditToken).not.toHaveBeenCalled();
      expect(page.props.children[0].props).toEqual({ shop: publicShop });
    },
  );
});
