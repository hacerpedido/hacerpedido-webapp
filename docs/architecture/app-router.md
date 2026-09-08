# App Router ownership

The App Router under `app/` owns the application's pages, layouts, boundaries,
and route handlers.

## Current ownership

- `app/page.tsx`, `app/[slug]/page.tsx`, and `app/cart/page.tsx` own the public
  home, shop, and checkout pages.
- `app/[slug]/edit/page.tsx` owns token-based shop management.
- `app/layout.tsx` owns global metadata and stylesheet imports for every route.
- `app/providers.tsx` supplies the single `CartProvider` to the App Router tree.
- `app/error.tsx`, `app/loading.tsx`, and `app/not-found.tsx` own route error,
  loading, and not-found handling.
- `app/api/` owns the internal route handlers for editor, images, home, and shop
  data.

## Routing rule

Add new pages and route handlers under `app/` in their explicitly assigned
segments. Keep shared client state behind `app/providers.tsx`; server layouts
and pages must not import `CartContext` directly.
