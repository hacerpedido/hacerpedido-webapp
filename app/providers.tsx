"use client";

import { CartProvider } from "#lib/context/CartContext";

import type { ReactNode } from "react";

/**
 * Client providers for App Router routes.
 *
 * Pages Router routes keep using pages/_app.tsx, so the two routers do not
 * share a React tree until a route is migrated deliberately.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
