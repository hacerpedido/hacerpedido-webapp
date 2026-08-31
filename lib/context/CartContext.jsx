import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from "react";

// ── Constants ───────────────────────────────────────────────────────────────────
const CART_FORM_KEY = "hacerpedido_cart_form";
const CartContext = createContext(null);

// ── SSR-safe localStorage helpers ───────────────────────────────────────────────
function getStorageValue(key, defaultValue) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageValue(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

// ── Initial state ───────────────────────────────────────────────────────────────
const initialState = {
  shop: null,
  products: [],
  totalAmount: 0,
  name: "",
  address: "",
  notes: "",
};

// ── Reducer ─────────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "SET_SHOP": {
      const shop = action.payload;
      const shopHasChanged = state.shop?.slug !== shop?.slug;

      if (!shop || (shopHasChanged && shop?.products == null)) {
        return { ...state, shop: shop || null, products: [], totalAmount: 0 };
      }

      if (shopHasChanged || !state.products?.length) {
        const products = (shop.products || []).map((obj) => ({ ...obj, amount: 0 }));
        return { ...state, shop, products, totalAmount: 0 };
      }

      return state;
    }

    case "SET_AMOUNT": {
      const { product, amount } = action.payload;
      if (amount < 0 || product == null) return state;

      const index = state.products.findIndex((p) => p.id === product.id);
      if (index === -1) return state;

      const products = state.products.map((p, i) => (i === index ? { ...p, amount } : p));
      const totalAmount = products.reduce((prev, p) => prev + p.amount, 0);

      return { ...state, products, totalAmount };
    }

    case "SET_NAME":
      return { ...state, name: action.payload ?? "" };

    case "SET_ADDRESS":
      return { ...state, address: action.payload ?? "" };

    case "SET_NOTES":
      return { ...state, notes: action.payload ?? "" };

    case "CLEAR_CART":
      return { ...initialState };

    default:
      return state;
  }
}

// ── Provider ────────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const hydrated = useRef(false);

  // Hydrate persisted cart form from localStorage on client mount
  useEffect(() => {
    const saved = getStorageValue(CART_FORM_KEY, {});
    if (saved.name) dispatch({ type: "SET_NAME", payload: saved.name });
    if (saved.address) dispatch({ type: "SET_ADDRESS", payload: saved.address });
    if (saved.notes) dispatch({ type: "SET_NOTES", payload: saved.notes });
    hydrated.current = true;
  }, []);

  // Persist cart form data to localStorage on change
  useEffect(() => {
    if (!hydrated.current) return;
    setStorageValue(CART_FORM_KEY, {
      name: state.name,
      address: state.address,
      notes: state.notes,
    });
  }, [state.name, state.address, state.notes]);

  const stableDispatch = useCallback(dispatch, []);

  return (
    <CartContext.Provider value={{ state, dispatch: stableDispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────────────────────────
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}