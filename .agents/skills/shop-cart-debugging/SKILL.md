---
name: shop-cart-debugging
description: Diagnose HacerPedido shop listing, shop detail, and cart state bugs. Use when investigating stale requests, loading states, persisted state, navigation, or catalog inconsistencies.
---

# Shop and cart debugging

Trace issues across the shop API, page effects, `CartContext`, localStorage, and the checkout route before changing state behavior.

## Debugging checklist

- Identify the source of truth: current API response, selected shop, cart state, or persisted storage.
- Reproduce navigation and reload sequences, not only the initial render.
- Ensure requests are keyed by the current slug/category and stale responses cannot overwrite newer state.
- Model loading, empty, error, and success states explicitly.
- Replace stale category results rather than merging archived or private shops back into the list.
- Add a focused regression test before broad refactoring.

Use the E2E skill for browser journeys and the checkout skill for order persistence or handoff changes.
