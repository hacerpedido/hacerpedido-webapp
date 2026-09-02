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

const { getDevelopmentShopEditToken, getPublicShop } =
  require("#lib/api/server-shops");
const PublicShopPage = require("./page").default;

const publicShop = { slug: "public-shop", products: [] };
const originalNodeEnv = process.env.NODE_ENV;

async function renderPublicShopPage() {
  return PublicShopPage({
    params: Promise.resolve({ slug: publicShop.slug }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  getPublicShop.mockResolvedValue(publicShop);
});

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

describe("public shop development editor link data", () => {
  test("loads and passes the editor token only in development", async () => {
    process.env.NODE_ENV = "development";
    getDevelopmentShopEditToken.mockResolvedValue("development-token");

    const page = await renderPublicShopPage();

    expect(getDevelopmentShopEditToken).toHaveBeenCalledWith(publicShop.slug);
    expect(page.props.children[0].props).toEqual({
      shop: publicShop,
      editToken: "development-token",
    });
  });

  test.each(["test", "production"])(
    "does not pass editor token in %s",
    async (nodeEnv) => {
      process.env.NODE_ENV = nodeEnv;

      const page = await renderPublicShopPage();

      expect(getDevelopmentShopEditToken).not.toHaveBeenCalled();
      expect(page.props.children[0].props).toEqual({ shop: publicShop });
    },
  );
});
