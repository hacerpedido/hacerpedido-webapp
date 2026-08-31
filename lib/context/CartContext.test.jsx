import React from "react";
import { render, act, cleanup, screen } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";

// ── Helper: test component that reads from context ──────────────────────────────
let readState;
function TestConsumer() {
  const { state, dispatch } = useCart();
  readState = { state, dispatch };
  return null;
}

function renderProvider() {
  render(
    <CartProvider>
      <TestConsumer />
    </CartProvider>
  );
}

beforeEach(() => {
  readState = null;
  cleanup();
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
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: firstShop }); });

    expect(readState.state.shop).toEqual(firstShop);
    expect(readState.state.products).toEqual([
      { id: 1, name: "Ñoquis", amount: 0 },
      { id: 2, name: "Café", amount: 0 },
    ]);
    expect(readState.state.totalAmount).toBe(0);
  });

  test("recalculates total amount after changing a product amount", () => {
    renderProvider();
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: firstShop }); });
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
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: firstShop }); });
    act(() => {
      readState.dispatch({
        type: "SET_AMOUNT",
        payload: { product: firstShop.products[0], amount: 2 },
      });
    });

    const afterFirstShop = { ...readState.state };

    act(() => { readState.dispatch({ type: "SET_SHOP", payload: firstShop }); });

    // Same shop returns the same state reference (preserves order)
    expect(readState.state.shop).toBe(afterFirstShop.shop);

    act(() => { readState.dispatch({ type: "SET_SHOP", payload: secondShop }); });

    expect(readState.state.shop).toEqual(secondShop);
    expect(readState.state.products).toEqual([{ id: 3, name: "Agua", amount: 0 }]);
    expect(readState.state.totalAmount).toBe(0);
  });

  test("ignores negative amount in SET_AMOUNT", () => {
    renderProvider();
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: firstShop }); });
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
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: firstShop }); });
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
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: { slug: "empty-shop", products: [] } }); });

    expect(readState.state.products).toEqual([]);
    expect(readState.state.totalAmount).toBe(0);
  });

  test("defaults to empty products when products field is missing", () => {
    renderProvider();
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: { slug: "no-products" } }); });

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
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: firstShop }); });
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
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: firstShop }); });
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
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: firstShop }); });
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: null }); });

    expect(readState.state.shop).toBe(null);
    expect(readState.state.products).toEqual([]);
    expect(readState.state.totalAmount).toBe(0);
  });

  test("SET_SHOP with undefined sets shop to null and clears products", () => {
    renderProvider();
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: firstShop }); });
    act(() => { readState.dispatch({ type: "SET_SHOP", payload: undefined }); });

    expect(readState.state.shop).toBe(null);
    expect(readState.state.products).toEqual([]);
    expect(readState.state.totalAmount).toBe(0);
  });
});

// ── SET_NAME / SET_ADDRESS / SET_NOTES ──────────────────────────────────────────

describe("cart form state", () => {
  test("sets name to empty string when payload is undefined", () => {
    renderProvider();
    act(() => { readState.dispatch({ type: "SET_NAME" }); });
    expect(readState.state.name).toBe("");
  });

  test("sets name to empty string when payload is null", () => {
    renderProvider();
    act(() => { readState.dispatch({ type: "SET_NAME", payload: null }); });
    expect(readState.state.name).toBe("");
  });

  test("sets name, address, notes correctly", () => {
    renderProvider();
    act(() => { readState.dispatch({ type: "SET_NAME", payload: "Ana" }); });
    act(() => { readState.dispatch({ type: "SET_ADDRESS", payload: "Av. Siempre Viva 123" }); });
    act(() => { readState.dispatch({ type: "SET_NOTES", payload: "Sin cebolla" }); });

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
    act(() => { readState.dispatch({ type: "SET_NAME", payload: "Ana" }); });
    act(() => { readState.dispatch({ type: "SET_NAME", payload: "Juan" }); });
    expect(readState.state.name).toBe("Juan");
  });

  test("accepts empty string as name", () => {
    renderProvider();
    act(() => { readState.dispatch({ type: "SET_NAME", payload: "" }); });
    expect(readState.state.name).toBe("");
  });

  test("accepts number as name", () => {
    renderProvider();
    act(() => { readState.dispatch({ type: "SET_NAME", payload: 123 }); });
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
    act(() => { readState.dispatch({ type: "SET_NAME", payload: "Ana" }); });
    act(() => { readState.dispatch({ type: "CLEAR_CART" }); });

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

// ── Persistence ─────────────────────────────────────────────────────────────────

describe("cart form persistence", () => {
  beforeEach(() => {
    localStorage.setItem(
      "hacerpedido_cart_form",
      JSON.stringify({ name: "Ana", address: "Calle Falsa 123", notes: "Test" })
    );
  });

  test("hydrates persisted form data from localStorage", () => {
    renderProvider();

    expect(readState.state.name).toBe("Ana");
    expect(readState.state.address).toBe("Calle Falsa 123");
    expect(readState.state.notes).toBe("Test");
  });

  test("writes form data to localStorage on change", () => {
    renderProvider();
    act(() => { readState.dispatch({ type: "SET_NAME", payload: "Juan" }); });

    const saved = JSON.parse(localStorage.getItem("hacerpedido_cart_form"));
    expect(saved.name).toBe("Juan");
  });
});

// ── useCart outside provider ─────────────────────────────────────────────────────

describe("useCart outside provider", () => {
  test("throws an error", () => {
    // Suppress console.error from React for the expected error
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useCart must be used within a CartProvider"
    );
    spy.mockRestore();
  });
});