"use client";

import { CartProvider } from "#lib/context/CartContext";

import type { ReactNode } from "react";

/**
 * Client providers for all App Router routes.
 *
 * Keeping CartProvider here preserves the cart across client navigation and
 * gives every storefront and checkout route the same cart state.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
