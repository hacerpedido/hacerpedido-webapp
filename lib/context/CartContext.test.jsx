import { act, cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { __CART_STATE_KEY, CartProvider, useCart } from "./CartContext";

// ── Helper: test component that reads from context ──────────────────────────────
let readState;
function TestConsumer() {
  const { state, dispatch, isHydrated } = useCart();
  readState = { state, dispatch, isHydrated };
  return null;
}

function renderProvider() {
  render(
    <CartProvider>
      <TestConsumer />
    </CartProvider>,
  );
}

const CART_STATE_KEY = __CART_STATE_KEY;

beforeEach(() => {
  readState = null;
  cleanup();
  localStorage.removeItem(CART_STATE_KEY);
  localStorage.removeItem("hacerpedido_cart_form");
});

// ── Initial state ───────────────────────────────────────────────────────────────

describe("CartContext initial state", () => {
  test("initializes with empty/null state", () => {
    renderProvider();
    expect(readState.state).toEqual({
      shop: null,
      products: [],
      totalAmount: 0,
      name: "",
      address: "",
      notes: "",
    });
  });

  test("isHydrated is true after mount (hydration effect has run)", () => {
    renderProvider();
    // After render + effects, isHydrated reflects the hydration status
    expect(readState.isHydrated).toBe(true);
  });
});

// ── SET_SHOP ────────────────────────────────────────────────────────────────────

describe("SET_SHOP", () => {
  const firstShop = {
    slug: "shop-a",
    products: [
      { id: 1, name: "Ñoquis" },
      { id: 2, name: "Café" },
    ],
  };
  const secondShop = { slug: "shop-b", products: [{ id: 3, name: "Agua" }] };

  test("sets shop and initializes product amounts to 0", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: firstShop });
    });

    expect(readState.state.shop).toEqual(firstShop);
    expect(readState.state.products).toEqual([
      { id: 1, name: "Ñoquis", amount: 0 },
      { id: 2, name: "Café", amount: 0 },
    ]);
    expect(readState.state.totalAmount).toBe(0);
  });

  test("recalculates total amount after changing a product amount", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: firstShop });
    });
    act(() => {
      readState.dispatch({
        type: "SET_AMOUNT",
        payload: { product: firstShop.products[1], amount: 3 },
      });
    });

    expect(readState.state.shop).toEqual(firstShop);
    expect(readState.state.products).toEqual([
      { id: 1, name: "Ñoquis", amount: 0 },
      { id: 2, name: "Café", amount: 3 },
    ]);
    expect(readState.state.totalAmount).toBe(3);
  });

  test("keeps the current order when setting the same shop and resets on new shop", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: firstShop });
    });
    act(() => {
      readState.dispatch({
        type: "SET_AMOUNT",
        payload: { product: firstShop.products[0], amount: 2 },
      });
    });

    const afterFirstShop = { ...readState.state };

    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: firstShop });
    });

    // Same shop returns the same state reference (preserves order)
    expect(readState.state.shop).toBe(afterFirstShop.shop);

    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: secondShop });
    });

    expect(readState.state.shop).toEqual(secondShop);
    expect(readState.state.products).toEqual([
      { id: 3, name: "Agua", amount: 0 },
    ]);
    expect(readState.state.totalAmount).toBe(0);
  });

  test("ignores negative amount in SET_AMOUNT", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: firstShop });
    });
    act(() => {
      readState.dispatch({
        type: "SET_AMOUNT",
        payload: { product: firstShop.products[0], amount: -1 },
      });
    });

    expect(readState.state.products[0].amount).toBe(0);
    expect(readState.state.totalAmount).toBe(0);
  });

  test("accepts zero amount in SET_AMOUNT", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: firstShop });
    });
    act(() => {
      readState.dispatch({
        type: "SET_AMOUNT",
        payload: { product: firstShop.products[0], amount: 5 },
      });
    });
    act(() => {
      readState.dispatch({
        type: "SET_AMOUNT",
        payload: { product: firstShop.products[0], amount: 0 },
      });
    });

    expect(readState.state.products[0].amount).toBe(0);
    expect(readState.state.totalAmount).toBe(0);
  });

  test("handles shop with no products", () => {
    renderProvider();
    act(() => {
      readState.dispatch({
        type: "SET_SHOP",
        payload: { slug: "empty-shop", products: [] },
      });
    });

    expect(readState.state.products).toEqual([]);
    expect(readState.state.totalAmount).toBe(0);
  });

  test("defaults to empty products when products field is missing", () => {
    renderProvider();
    act(() => {
      readState.dispatch({
        type: "SET_SHOP",
        payload: { slug: "no-products" },
      });
    });

    expect(readState.state.products).toEqual([]);
  });

  test("defaults to empty array for null products", () => {
    renderProvider();
    act(() => {
      readState.dispatch({
        type: "SET_SHOP",
        payload: { slug: "null-products", products: null },
      });
    });

    expect(readState.state.products).toEqual([]);
  });

  test("setAmount with unknown product does not crash", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: firstShop });
    });
    act(() => {
      readState.dispatch({
        type: "SET_AMOUNT",
        payload: { product: { id: 999 }, amount: 5 },
      });
    });

    // Should not crash, just no-op
    expect(readState.state.totalAmount).toBe(0);
  });

  test("setAmount with undefined product does not crash", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: firstShop });
    });
    act(() => {
      readState.dispatch({
        type: "SET_AMOUNT",
        payload: { product: undefined, amount: 5 },
      });
    });

    expect(readState.state.totalAmount).toBe(0);
  });

  test("SET_SHOP with null sets shop to null and clears products", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: firstShop });
    });
    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: null });
    });

    expect(readState.state.shop).toBe(null);
    expect(readState.state.products).toEqual([]);
    expect(readState.state.totalAmount).toBe(0);
  });

  test("SET_SHOP with undefined sets shop to null and clears products", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: firstShop });
    });
    act(() => {
      readState.dispatch({ type: "SET_SHOP", payload: undefined });
    });

    expect(readState.state.shop).toBe(null);
    expect(readState.state.products).toEqual([]);
    expect(readState.state.totalAmount).toBe(0);
  });
});

// ── SET_NAME / SET_ADDRESS / SET_NOTES ──────────────────────────────────────────

describe("cart form state", () => {
  test("sets name to empty string when payload is undefined", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_NAME" });
    });
    expect(readState.state.name).toBe("");
  });

  test("sets name to empty string when payload is null", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_NAME", payload: null });
    });
    expect(readState.state.name).toBe("");
  });

  test("sets name, address, notes correctly", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_NAME", payload: "Ana" });
    });
    act(() => {
      readState.dispatch({
        type: "SET_ADDRESS",
        payload: "Av. Siempre Viva 123",
      });
    });
    act(() => {
      readState.dispatch({ type: "SET_NOTES", payload: "Sin cebolla" });
    });

    expect(readState.state).toEqual({
      shop: null,
      products: [],
      totalAmount: 0,
      name: "Ana",
      address: "Av. Siempre Viva 123",
      notes: "Sin cebolla",
    });
  });

  test("overwrites previous name value", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_NAME", payload: "Ana" });
    });
    act(() => {
      readState.dispatch({ type: "SET_NAME", payload: "Juan" });
    });
    expect(readState.state.name).toBe("Juan");
  });

  test("accepts empty string as name", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_NAME", payload: "" });
    });
    expect(readState.state.name).toBe("");
  });

  test("accepts number as name", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "SET_NAME", payload: 123 });
    });
    expect(readState.state.name).toBe(123);
  });
});

// ── CLEAR_CART ──────────────────────────────────────────────────────────────────

describe("CLEAR_CART", () => {
  test("resets to initial state", () => {
    renderProvider();
    act(() => {
      readState.dispatch({
        type: "SET_SHOP",
        payload: { slug: "test", products: [{ id: 1, name: "Test" }] },
      });
    });
    act(() => {
      readState.dispatch({ type: "SET_NAME", payload: "Ana" });
    });
    act(() => {
      readState.dispatch({ type: "CLEAR_CART" });
    });

    expect(readState.state).toEqual({
      shop: null,
      products: [],
      totalAmount: 0,
      name: "",
      address: "",
      notes: "",
    });
  });
});

// ── HYDRATE ─────────────────────────────────────────────────────────────────────

describe("HYDRATE", () => {
  test("restores shop, products with amounts, and total", () => {
    renderProvider();
    act(() => {
      readState.dispatch({
        type: "HYDRATE",
        payload: {
          shop: { slug: "restored-shop", name: "Restored" },
          products: [
            { id: 1, name: "Product A", amount: 3 },
            { id: 2, name: "Product B", amount: 1 },
          ],
          name: "Carlos",
          address: "Calle 123",
          notes: "Door 4",
        },
      });
    });

    expect(readState.state.shop).toEqual({
      slug: "restored-shop",
      name: "Restored",
    });
    expect(readState.state.products).toEqual([
      { id: 1, name: "Product A", amount: 3 },
      { id: 2, name: "Product B", amount: 1 },
    ]);
    expect(readState.state.totalAmount).toBe(4);
    expect(readState.state.name).toBe("Carlos");
    expect(readState.state.address).toBe("Calle 123");
    expect(readState.state.notes).toBe("Door 4");
  });

  test("handles empty payload gracefully", () => {
    renderProvider();
    act(() => {
      readState.dispatch({ type: "HYDRATE", payload: null });
    });

    expect(readState.state.shop).toBeNull();
    expect(readState.state.products).toEqual([]);
    expect(readState.state.totalAmount).toBe(0);
  });

  test("handles missing products in payload", () => {
    renderProvider();
    act(() => {
      readState.dispatch({
        type: "HYDRATE",
        payload: { shop: { slug: "s" }, name: "Test" },
      });
    });

    expect(readState.state.shop).toEqual({ slug: "s" });
    expect(readState.state.products).toEqual([]);
    expect(readState.state.totalAmount).toBe(0);
    expect(readState.state.name).toBe("Test");
  });

  test("normalizes null/undefined amounts to 0", () => {
    renderProvider();
    act(() => {
      readState.dispatch({
        type: "HYDRATE",
        payload: {
          shop: { slug: "s" },
          products: [
            { id: 1, amount: null },
            { id: 2, amount: undefined },
            { id: 3 },
          ],
        },
      });
    });

    expect(readState.state.products[0].amount).toBe(0);
    expect(readState.state.products[1].amount).toBe(0);
    expect(readState.state.products[2].amount).toBe(0);
  });

  test("SET_SHOP with same slug after HYDRATE preserves restored amounts", () => {
    renderProvider();

    // Simulate hydration from persisted state
    act(() => {
      readState.dispatch({
        type: "HYDRATE",
        payload: {
          shop: { slug: "my-shop", name: "My Shop" },
          products: [{ id: 10, name: "Milanesa", amount: 2 }],
          name: "",
          address: "",
          notes: "",
        },
      });
    });

    expect(readState.state.products[0].amount).toBe(2);

    // Simulate the shop page re-fetching from the API (same slug)
    act(() => {
      readState.dispatch({
        type: "SET_SHOP",
        payload: {
          slug: "my-shop",
          name: "My Shop",
          products: [{ id: 10, name: "Milanesa", description: "Clásica" }],
        },
      });
    });

    // Amounts should be preserved because the slug hasn't changed
    expect(readState.state.products[0].amount).toBe(2);
    expect(readState.state.totalAmount).toBe(2);
  });

  test("SET_SHOP with different slug after HYDRATE resets amounts", () => {
    renderProvider();

    act(() => {
      readState.dispatch({
        type: "HYDRATE",
        payload: {
          shop: { slug: "old-shop" },
          products: [{ id: 1, name: "Item", amount: 5 }],
        },
      });
    });

    act(() => {
      readState.dispatch({
        type: "SET_SHOP",
        payload: { slug: "new-shop", products: [{ id: 2, name: "New Item" }] },
      });
    });

    expect(readState.state.shop.slug).toBe("new-shop");
    expect(readState.state.products[0].amount).toBe(0);
    expect(readState.state.totalAmount).toBe(0);
  });
});

// ── Persistence ─────────────────────────────────────────────────────────────────

describe("full state persistence", () => {
  test("writes complete cart state to localStorage on meaningful changes", () => {
    renderProvider();
    act(() => {
      readState.dispatch({
        type: "SET_SHOP",
        payload: {
          slug: "test-shop",
          name: "Test",
          products: [{ id: 1, name: "P1" }],
        },
      });
    });
    act(() => {
      readState.dispatch({
        type: "SET_AMOUNT",
        payload: { product: { id: 1 }, amount: 2 },
      });
    });
    act(() => {
      readState.dispatch({ type: "SET_NAME", payload: "Ana" });
    });

    const saved = JSON.parse(localStorage.getItem(CART_STATE_KEY));
    expect(saved.shop.slug).toBe("test-shop");
    expect(saved.products).toEqual([{ id: 1, name: "P1", amount: 2 }]);
    expect(saved.totalAmount).toBe(2);
    expect(saved.name).toBe("Ana");
  });

  test("removes storage key when state is fully empty (no shop, no products, no form)", () => {
    renderProvider();
    // Nothing dispatched, state is initial → should not persist
    const saved = localStorage.getItem(CART_STATE_KEY);
    expect(saved).toBeNull();
  });

  test("removes storage key after CLEAR_CART persists empty state", () => {
    renderProvider();
    act(() => {
      readState.dispatch({
        type: "SET_SHOP",
        payload: { slug: "s", products: [{ id: 1, name: "P1" }] },
      });
    });
    act(() => {
      readState.dispatch({ type: "CLEAR_CART" });
    });

    const saved = localStorage.getItem(CART_STATE_KEY);
    expect(saved).toBeNull();
  });
});

describe("hydration from localStorage", () => {
  beforeEach(() => {
    localStorage.setItem(
      CART_STATE_KEY,
      JSON.stringify({
        shop: {
          slug: "local-shop",
          name: "Local Shop",
          orderswhatsappnumber: "+5491100000000",
        },
        products: [{ id: 42, name: "Local Product", amount: 3 }],
        totalAmount: 3,
        name: "María",
        address: "Av. Siempre Viva 742",
        notes: "Test notes",
      }),
    );
  });

  test("hydrates full state from localStorage on mount", () => {
    renderProvider();

    expect(readState.state.shop.slug).toBe("local-shop");
    expect(readState.state.products).toEqual([
      { id: 42, name: "Local Product", amount: 3 },
    ]);
    expect(readState.state.totalAmount).toBe(3);
    expect(readState.state.name).toBe("María");
    expect(readState.state.address).toBe("Av. Siempre Viva 742");
    expect(readState.state.notes).toBe("Test notes");
  });

  test("isHydrated is true after hydration from storage", () => {
    renderProvider();
    expect(readState.isHydrated).toBe(true);
  });
});

describe("malformed localStorage handling", () => {
  test("handles invalid JSON in localStorage gracefully", () => {
    localStorage.setItem(CART_STATE_KEY, "not-json-at-all");
    renderProvider();
    expect(readState.state.shop).toBeNull();
  });

  test("handles missing shop in persisted data", () => {
    localStorage.setItem(CART_STATE_KEY, JSON.stringify({ name: "Only Name" }));
    renderProvider();
    expect(readState.state.shop).toBeNull();
    // Form fields without a shop are ignored during hydration
    expect(readState.state.name).toBe("");
  });
});

// ── useCart outside provider ─────────────────────────────────────────────────────

describe("useCart outside provider", () => {
  test("throws an error", () => {
    // Suppress console.error from React for the expected error
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useCart must be used within a CartProvider",
    );
    spy.mockRestore();
  });
});
