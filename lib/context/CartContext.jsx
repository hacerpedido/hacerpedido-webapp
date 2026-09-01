import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

// ── Constants ───────────────────────────────────────────────────────────────────
const CART_STATE_KEY = "hacerpedido_cart_state";
const CART_FORM_KEY_LEGACY = "hacerpedido_cart_form";
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
    case "HYDRATE": {
      const payload = action.payload || {};
      const products = (payload.products || []).map((p) => ({
        ...p,
        amount: p.amount || 0,
      }));
      const totalAmount = products.reduce((prev, p) => prev + p.amount, 0);
      return {
        shop: payload.shop || null,
        products,
        totalAmount,
        name: payload.name ?? "",
        address: payload.address ?? "",
        notes: payload.notes ?? "",
      };
    }

    case "SET_SHOP": {
      const shop = action.payload;
      const shopHasChanged = state.shop?.slug !== shop?.slug;

      if (!shop || (shopHasChanged && shop?.products == null)) {
        return { ...state, shop: shop || null, products: [], totalAmount: 0 };
      }

      if (shopHasChanged || !state.products?.length) {
        const products = (shop.products || []).map((obj) => ({
          ...obj,
          amount: 0,
        }));
        return { ...state, shop, products, totalAmount: 0 };
      }

      return state;
    }

    case "SET_AMOUNT": {
      const { product, amount } = action.payload;
      if (amount < 0 || product == null) return state;

      const index = state.products.findIndex((p) => p.id === product.id);
      if (index === -1) return state;

      const products = state.products.map((p, i) =>
        i === index ? { ...p, amount } : p,
      );
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
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrated = useRef(false);

  // Hydrate persisted full cart state from localStorage on client mount
  useEffect(() => {
    const saved = getStorageValue(CART_STATE_KEY, null);

    if (saved && saved.shop && saved.shop.slug) {
      dispatch({
        type: "HYDRATE",
        payload: {
          shop: saved.shop,
          products: saved.products || [],
          name: saved.name ?? "",
          address: saved.address ?? "",
          notes: saved.notes ?? "",
        },
      });
    }

    // Clean up legacy per-field key now that we persist the full state
    try {
      window.localStorage.removeItem(CART_FORM_KEY_LEGACY);
    } catch {
      /* noop */
    }

    hydrated.current = true;
    setIsHydrated(true);
  }, []);

  // Persist full cart state to localStorage on every meaningful change
  useEffect(() => {
    if (!hydrated.current) return;

    const toPersist = {
      shop: state.shop,
      products: state.products,
      totalAmount: state.totalAmount,
      name: state.name,
      address: state.address,
      notes: state.notes,
    };

    // Don't persist transient empty state that would look like "no cart" on reload
    if (
      !toPersist.shop &&
      !toPersist.products.length &&
      !toPersist.name &&
      !toPersist.address &&
      !toPersist.notes
    ) {
      try {
        window.localStorage.removeItem(CART_STATE_KEY);
      } catch {
        /* noop */
      }
      return;
    }

    setStorageValue(CART_STATE_KEY, toPersist);
  }, [
    state.shop,
    state.products,
    state.totalAmount,
    state.name,
    state.address,
    state.notes,
  ]);

  const stableDispatch = useCallback(dispatch, []);

  return (
    <CartContext.Provider
      value={{ state, dispatch: stableDispatch, isHydrated }}
    >
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

// Export key for tests
export const __CART_STATE_KEY = CART_STATE_KEY;
