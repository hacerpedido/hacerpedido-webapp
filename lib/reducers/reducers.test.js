import { setName, setAddress, setNotes } from "./cartSlice";
import cartReducer from "./cartSlice";
import { setCategory, setFirstVisibleItem, setShops } from "./homeSlice";
import homeReducer from "./homeSlice";
import { setAmount, setShop } from "./shopSlice";
import shopReducer from "./shopSlice";
import { loading } from "./appSlice";
import appReducer from "./appSlice";
import { setTempProducts } from "./shopEditSlice";
import shopEditReducer from "./shopEditSlice";
import { persistor, store } from "./index";

// ── appSlice ───────────────────────────────────────────────────────────────────

describe("appSlice", () => {
  test("initial state has loading: true", () => {
    expect(appReducer(undefined, { type: "@@INIT" })).toEqual({ loading: true });
  });

  test("loading action sets the value", () => {
    expect(appReducer(undefined, loading(false))).toEqual({ loading: false });
    expect(appReducer(undefined, loading(true))).toEqual({ loading: true });
  });

  test("loading action with undefined payload sets undefined", () => {
    const result = appReducer(undefined, loading(undefined));
    expect(result.loading).toBe(undefined);
  });

  test("loading action with null payload sets null", () => {
    const result = appReducer(undefined, loading(null));
    expect(result.loading).toBe(null);
  });
});

// ── cartSlice ──────────────────────────────────────────────────────────────────

describe("cartSlice", () => {
  test("keeps the persisted cart shape", () => {
    expect(cartReducer(undefined, { type: "@@INIT" })).toEqual({
      name: null,
      address: null,
      notes: null,
    });
  });

  test("updates each persisted cart field", () => {
    const state = cartReducer(cartReducer(undefined, { type: "@@INIT" }), setName("Ana"));

    expect(cartReducer(cartReducer(state, setAddress("Av. Siempre Viva 123")), setNotes("Sin cebolla"))).toEqual({
      name: "Ana",
      address: "Av. Siempre Viva 123",
      notes: "Sin cebolla",
    });
  });

  // Edge: undefined payload
  test("sets name to undefined when payload is undefined", () => {
    expect(cartReducer(undefined, setName(undefined)).name).toBe(undefined);
  });

  test("sets address to undefined when payload is undefined", () => {
    expect(cartReducer(undefined, setAddress(undefined)).address).toBe(undefined);
  });

  test("sets notes to undefined when payload is undefined", () => {
    expect(cartReducer(undefined, setNotes(undefined)).notes).toBe(undefined);
  });

  // Edge: null payload
  test("sets name to null when payload is null", () => {
    const state = cartReducer(cartReducer(undefined, setName("Ana")), setName(null));
    expect(state.name).toBe(null);
  });

  // Edge: overwriting existing values
  test("overwrites previous name value", () => {
    const state = cartReducer(cartReducer(undefined, setName("Ana")), setName("Juan"));
    expect(state.name).toBe("Juan");
  });

  // Edge: empty string payload
  test("accepts empty string as name", () => {
    expect(cartReducer(undefined, setName("")).name).toBe("");
  });

  // Edge: number payload (type coersion)
  test("accepts number as name", () => {
    expect(cartReducer(undefined, setName(123)).name).toBe(123);
  });
});

// ── homeSlice ──────────────────────────────────────────────────────────────────

describe("homeSlice", () => {
  test("keeps the persisted home shape", () => {
    expect(homeReducer(undefined, { type: "@@INIT" })).toEqual({
      shops: [],
      selectedFilter: "Comida",
      firstVisibleItem: 0,
    });
  });

  test("resets the visible item when changing category", () => {
    const state = homeReducer(homeReducer(homeReducer(undefined, { type: "@@INIT" }), setFirstVisibleItem(4)), setCategory("Bebidas"));

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

  // Edge: setCategory with null
  test("setCategory with null sets selectedFilter to null", () => {
    const state = homeReducer(undefined, setCategory(null));
    expect(state.selectedFilter).toBe(null);
    expect(state.firstVisibleItem).toBe(0);
  });

  // Edge: setCategory with undefined
  test("setCategory with undefined sets selectedFilter to undefined", () => {
    const state = homeReducer(undefined, setCategory(undefined));
    expect(state.selectedFilter).toBe(undefined);
  });

  // Edge: setShops with null
  test("setShops with null sets shops to null", () => {
    const state = homeReducer(undefined, setShops(null));
    expect(state.shops).toBe(null);
  });

  // Edge: setShops with undefined
  test("setShops with undefined sets shops to undefined", () => {
    const state = homeReducer(undefined, setShops(undefined));
    expect(state.shops).toBe(undefined);
  });

  // Edge: setFirstVisibleItem preserves the value across setShops
  test("setFirstVisibleItem persists after setShops", () => {
    const state = homeReducer(homeReducer(undefined, setFirstVisibleItem(5)), setShops([{ slug: "a" }]));
    expect(state.firstVisibleItem).toBe(5);
  });

  // Edge: setFirstVisibleItem with negative value
  test("setFirstVisibleItem accepts negative values", () => {
    const state = homeReducer(undefined, setFirstVisibleItem(-1));
    expect(state.firstVisibleItem).toBe(-1);
  });
});

// ── shopSlice ──────────────────────────────────────────────────────────────────

describe("shopSlice", () => {
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

  // Edge: setAmount with negative amount (code ignores it with `if (amount >= 0)`)
  test("ignores negative amount in setAmount", () => {
    const loaded = shopReducer(undefined, setShop(firstShop));
    const state = shopReducer(loaded, setAmount({ product: firstShop.products[0], amount: -1 }));
    expect(state.products[0].amount).toBe(0);
    expect(state.totalAmount).toBe(0);
  });

  // Edge: setAmount with amount = 0 (allowed)
  test("accepts zero amount in setAmount", () => {
    const loaded = shopReducer(undefined, setShop(firstShop));
    const withPositive = shopReducer(loaded, setAmount({ product: firstShop.products[0], amount: 5 }));
    const state = shopReducer(withPositive, setAmount({ product: firstShop.products[0], amount: 0 }));
    expect(state.products[0].amount).toBe(0);
    expect(state.totalAmount).toBe(0);
  });

  // Edge: setShop with empty products array
  test("handles shop with no products", () => {
    const state = shopReducer(undefined, setShop({ slug: "empty-shop", products: [] }));
    expect(state.products).toEqual([]);
    expect(state.totalAmount).toBe(0);
  });

  // Edge: setShop with missing products field
  test("defaults to empty products when products field is missing", () => {
    const state = shopReducer(undefined, setShop({ slug: "no-products" }));
    expect(state.products).toEqual([]);
  });

  // Edge: setShop with null products
  test("defaults to empty array for null products", () => {
    const state = shopReducer(undefined, setShop({ slug: "null-products", products: null }));
    expect(state.products).toEqual([]);
  });

  // Edge: setAmount with product not in the list
  test("setAmount with unknown product crashes with index -1", () => {
    const loaded = shopReducer(undefined, setShop(firstShop));
    expect(() => {
      shopReducer(loaded, setAmount({ product: { id: 999 }, amount: 5 }));
    }).toThrow();
  });

  // Edge: setAmount with undefined payload fields
  test("setAmount with undefined product crashes", () => {
    const loaded = shopReducer(undefined, setShop(firstShop));
    expect(() => {
      shopReducer(loaded, setAmount({ product: undefined, amount: 5 }));
    }).toThrow();
  });

  // Edge: setShop with null payload
  test("setShop with null crashes when accessing slug", () => {
    expect(() => shopReducer(undefined, setShop(null))).toThrow();
  });

  // Edge: setShop with undefined payload crashes (payload is undefined, cannot access .slug)
  test("setShop with undefined crashes", () => {
    expect(() => shopReducer(undefined, setShop(undefined))).toThrow();
  });
});

// ── shopEditSlice ──────────────────────────────────────────────────────────────

describe("shopEditSlice", () => {
  test("initial state has tempProducts: null", () => {
    expect(shopEditReducer(undefined, { type: "@@INIT" })).toEqual({ tempProducts: null });
  });

  test("setTempProducts stores the products", () => {
    const products = [{ name: "test", price: "100" }];
    const state = shopEditReducer(undefined, setTempProducts({ tempProducts: products }));
    expect(state.tempProducts).toEqual(products);
  });

  // Edge: setTempProducts with null
  test("setTempProducts with null payload sets tempProducts to null", () => {
    const state = shopEditReducer(undefined, setTempProducts({ tempProducts: null }));
    expect(state.tempProducts).toBe(null);
  });

  // Edge: setTempProducts with undefined tempProducts
  test("setTempProducts with undefined tempProducts sets to undefined", () => {
    const state = shopEditReducer(undefined, setTempProducts({ tempProducts: undefined }));
    expect(state.tempProducts).toBe(undefined);
  });

  // Edge: setTempProducts with missing payload
  test("setTempProducts with undefined payload crashes", () => {
    expect(() => shopEditReducer(undefined, setTempProducts(undefined))).toThrow();
  });
});

// ── root persistence characterization ──────────────────────────────────────────

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