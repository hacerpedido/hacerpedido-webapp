import { setName, setAddress, setNotes } from "./cartSlice";
import cartReducer from "./cartSlice";
import { setCategory, setFirstVisibleItem, setShops } from "./homeSlice";
import homeReducer from "./homeSlice";
import { setAmount, setShop } from "./shopSlice";
import shopReducer from "./shopSlice";
import { persistor, store } from "./index";

describe("cart state characterization", () => {
  test("keeps the persisted cart shape", () => {
    expect(cartReducer(undefined, { type: "@@INIT" })).toEqual({
      name: null,
      address: null,
      notes: null,
    });
  });

  test("updates each persisted cart field", () => {
    const state = cartReducer(
      cartReducer(undefined, { type: "@@INIT" }),
      setName("Ana"),
    );

    expect(cartReducer(cartReducer(state, setAddress("Av. Siempre Viva 123")), setNotes("Sin cebolla"))).toEqual({
      name: "Ana",
      address: "Av. Siempre Viva 123",
      notes: "Sin cebolla",
    });
  });
});

describe("home state characterization", () => {
  test("keeps the persisted home shape", () => {
    expect(homeReducer(undefined, { type: "@@INIT" })).toEqual({
      shops: [],
      selectedFilter: "Comida",
      firstVisibleItem: 0,
    });
  });

  test("resets the visible item when changing category", () => {
    const state = homeReducer(
      homeReducer(
        homeReducer(undefined, { type: "@@INIT" }),
        setFirstVisibleItem(4),
      ),
      setCategory("Bebidas"),
    );

    expect(state).toEqual({
      shops: [],
      selectedFilter: "Bebidas",
      firstVisibleItem: 0,
    });
  });

  test("stores shops without changing the other home fields", () => {
    const shops = [{ slug: "shop-a" }];

    expect(homeReducer(undefined, setShops(shops))).toEqual({
      shops,
      selectedFilter: "Comida",
      firstVisibleItem: 0,
    });
  });
});

describe("shop state characterization", () => {
  const firstShop = {
    slug: "shop-a",
    products: [
      { id: 1, name: "Ñoquis" },
      { id: 2, name: "Café" },
    ],
  };
  const secondShop = { slug: "shop-b", products: [{ id: 3, name: "Agua" }] };

  test("keeps the non-persisted shop shape and initializes product amounts", () => {
    expect(shopReducer(undefined, { type: "@@INIT" })).toEqual({
      shop: null,
      products: [],
      totalAmount: 0,
    });

    expect(shopReducer(undefined, setShop(firstShop))).toEqual({
      shop: firstShop,
      products: [
        { id: 1, name: "Ñoquis", amount: 0 },
        { id: 2, name: "Café", amount: 0 },
      ],
      totalAmount: 0,
    });
  });

  test("recalculates the total amount after changing a product", () => {
    const loaded = shopReducer(undefined, setShop(firstShop));

    expect(shopReducer(loaded, setAmount({ product: firstShop.products[1], amount: 3 }))).toEqual({
      shop: firstShop,
      products: [
        { id: 1, name: "Ñoquis", amount: 0 },
        { id: 2, name: "Café", amount: 3 },
      ],
      totalAmount: 3,
    });
  });

  test("keeps the current order when setting the same shop and resets on a new shop", () => {
    const loaded = shopReducer(undefined, setShop(firstShop));
    const withAmount = shopReducer(loaded, setAmount({ product: firstShop.products[0], amount: 2 }));

    expect(shopReducer(withAmount, setShop(firstShop))).toBe(withAmount);
    expect(shopReducer(withAmount, setShop(secondShop))).toEqual({
      shop: secondShop,
      products: [{ id: 3, name: "Agua", amount: 0 }],
      totalAmount: 0,
    });
  });
});

describe("root persistence characterization", () => {
  test("persists cart and home while honoring the existing blacklist", async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    localStorage.removeItem("persist:root");

    store.dispatch(setName("Ana"));
    store.dispatch(setAddress("Av. Siempre Viva 123"));
    store.dispatch(setNotes("Sin cebolla"));
    store.dispatch(setCategory("Bebidas"));
    store.dispatch(setFirstVisibleItem(2));
    store.dispatch(setShops([{ slug: "shop-a" }]));
    store.dispatch(setShop({ slug: "shop-a", products: [{ id: 1, name: "Ñoquis" }] }));

    await persistor.flush();

    const persistedRoot = JSON.parse(localStorage.getItem("persist:root"));

    expect(Object.keys(persistedRoot).sort()).toEqual(["_persist", "cart", "home"]);
    expect(JSON.parse(persistedRoot.cart)).toEqual({
      name: "Ana",
      address: "Av. Siempre Viva 123",
      notes: "Sin cebolla",
    });
    expect(JSON.parse(persistedRoot.home)).toEqual({
      shops: [{ slug: "shop-a" }],
      selectedFilter: "Bebidas",
      firstVisibleItem: 2,
    });
    expect(persistedRoot.app).toBeUndefined();
    expect(persistedRoot.shop).toBeUndefined();
    expect(persistedRoot.shopEdit).toBeUndefined();
  });
});
