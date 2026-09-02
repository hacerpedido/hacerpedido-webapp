# App Router ownership

The App Router is scaffolded under `app/` for incremental migration. It does
not currently contain a `page.tsx`, so it claims no URL and cannot collide with
the existing Pages Router routes.

## Current ownership

- `pages/` owns the home, shop, cart, catch-all, and API routes.
- `app/layout.tsx` and its boundary files establish conventions for future App
  Router routes only.
- `app/providers.tsx` supplies `CartProvider` to future App Router routes.
- `pages/_app.tsx` continues to supply `CartProvider` to existing Pages Router
  routes. This deliberate duplication is safe because the routers are separate
  trees while migration is in progress.

## Migration rule

Add a new App Router route only in an explicitly assigned segment, and remove
or redirect the corresponding Pages Router route in the same migration change.
Do not add `app/page.tsx` (or another App Router page matching an existing
Pages Router URL) until that route is intentionally migrated. Keep shared
client state behind `app/providers.tsx`; server layouts and pages must not
import `CartContext` directly.
