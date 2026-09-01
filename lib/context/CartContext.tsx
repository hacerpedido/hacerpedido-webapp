import type { Dispatch, ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import type { CartState, Product, Shop } from "../types";

// ── Constants ───────────────────────────────────────────────────────────────────
const CART_STATE_KEY = "hacerpedido_cart_state";
const CART_FORM_KEY_LEGACY = "hacerpedido_cart_form";
export type CartAction =
  | { type: "RESTORE"; payload: Partial<CartState> }
  | { type: "SET_SHOP"; payload: Shop | null }
  | { type: "SET_AMOUNT"; payload: { product: Product; amount: number } }
  | {
      type: "SET_NAME" | "SET_ADDRESS" | "SET_NOTES";
      payload: string | null | undefined;
    }
  | { type: "CLEAR_CART" };

export interface CartContextValue {
  state: CartState;
  dispatch: Dispatch<CartAction>;
  isRestored: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

// ── SSR-safe localStorage helpers ───────────────────────────────────────────────
function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageValue<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

// ── Initial state ───────────────────────────────────────────────────────────────
export const initialState: CartState = {
  shop: null,
  products: [],
  totalAmount: 0,
  name: "",
  address: "",
  notes: "",
};

// ── Reducer ─────────────────────────────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "RESTORE": {
      const payload = action.payload || {};
      const products = (payload.products || []).map((p) => ({
        ...p,
        amount: p.amount || 0,
      }));
      const totalAmount = products.reduce(
        (prev, p) => prev + (p.amount ?? 0),
        0,
      );
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
      const totalAmount = products.reduce(
        (prev, p) => prev + (p.amount ?? 0),
        0,
      );

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
export function CartProvider({ children }: { children?: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isRestored, setIsRestored] = useState(false);
  const restored = useRef(false);

  // Restore the persisted cart from localStorage after the client mounts.
  useEffect(() => {
    const saved = getStorageValue<Partial<CartState> | null>(
      CART_STATE_KEY,
      null,
    );

    if (saved && saved.shop && saved.shop.slug) {
      dispatch({
        type: "RESTORE",
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

    restored.current = true;
    setIsRestored(true);
  }, []);

  // Persist full cart state to localStorage on every meaningful change
  useEffect(() => {
    if (!restored.current) return;

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

  return (
    <CartContext.Provider value={{ state, dispatch, isRestored }}>
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
