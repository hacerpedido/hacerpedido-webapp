---
name: checkout
description: Work on HacerPedido checkout, cart persistence, validation, and WhatsApp handoff. Use when changing pages/cart.jsx, CartContext, checkout forms, order restoration, or checkout tests.
---

# Checkout

The checkout lives in `pages/cart.jsx` and uses `CartContext` for the active shop and selected products. Submission validates the form and generates a pre-filled `wa.me` URL.

## Required checks

- Preserve the WhatsApp message contract and Argentine phone normalization.
- Keep address validation conditional on the selected delivery mode.
- Preserve cart state across reloads without restoring stale shop or catalog data.
- Clear or reconcile the in-progress order after successful handoff.
- Add unit or E2E coverage for validation, persistence, and the WhatsApp redirect.

Read `AGENTS.md` and `whatsapp-order/SKILL.md` before modifying checkout behavior.
