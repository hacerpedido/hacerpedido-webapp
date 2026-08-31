---
name: whatsapp-order
description: Build and debug the WhatsApp order flow for HacerPedido — generateWhatsappURL, sanitizeWhatsAppNumber (Argentine 54 + 0/9 normalization), wa.me links, cart checkout, order message formatting. Use when touching order messages, phone numbers, the cart page, wa.me URLs, or the utils that build them.
---

# WhatsApp order flow

Customers build a cart on a shop page and checkout sends a pre-filled WhatsApp message to the merchant's order-taking number.

## When to use

- Anything touching `generateWhatsappURL`, `sanitizeWhatsAppNumber`, `generateCallUrl`
- The cart/checkout page (`pages/cart.jsx`) or the order message format
- Argentine phone number handling or `wa.me` links

## The flow

1. Shop page: customer adds products (quantities per product). `ShopView` enables the cart when `shop.orderswhatsappnumber` exists (`!isPreview && shop && shop.orderswhatsappnumber`).
2. `pages/cart.jsx` collects form data (name, address, notes) and calls:
   `generateWhatsappURL(shop.orderswhatsappnumber, formData, productsByCategory)`.
3. `lib/utils/utils.js` builds the URL and the WhatsApp goes to `https://wa.me/<sanitized>?text=<encoded message>`.

## Key functions (`lib/utils/utils.js`)

- `sanitizeWhatsAppNumber(phone)` — strips `+`; for Argentine numbers starting `54`:
  - `54 0 xxx` → `549 xxx` (drops the 0)
  - `54 1..8 xxx` (no 9) → inserts `9` → `549 1..8 xxx`
  - `549...` is left as-is.
  - Non-Argentine numbers pass through unchanged.
  Example (from tests): `"+54223000000"` → `"549223000000"`, `"+540223000000"` → `"549223000000"`.
- `generateWhatsappURL(number, userData, items)` — sanitizes, builds message, `encodeURIComponent`, returns `https://wa.me/<n>?text=<msg>`.
- `generateCallUrl(number)` → `tel:<encoded>`.
- `validatePhoneNumber(phone)` — regex `^(\+?[0-9]{10,13})?$`, error message in Spanish.

## Message format

Without user data:

```
¡Hola! Quiero hacer un pedido via HacerPedido 💪
```

With user data (name/address/notes):

```
¡Hola! soy *NAME* y quiero hacer un pedido via HacerPedido 💪

📍 *Mi dirección:* ADDRESS
📝 *Notas:* NOTES

*Mi pedido:*
*CATEGORY*
✅ AMOUNT x PRODUCTNAME
```

- Lines are built by `categoryProducts` (`✅ amount x name`) and `productListForMessage` (per-category `*Category*` headers). See `references/message-format.md` for the exact template and a real encoded example.

## Rules

- **Always** sanitize Argentine numbers before building `wa.me` links (no `+`, no `0`/`9` mishaps). Target format: `549` + area code + number.
- **Keep message copy in Spanish** — it's user-facing product copy (Argentine market).
- The merchant's order number comes from `shop.orderswhatsappnumber`; `ShopFooter` falls back to a call button (`ButtonCall`) when it's missing.
- **Tests**: `lib/utils/utils.test.js` covers these helpers — keep them green when editing (message templates change → update expected URLs).
- E2E asserts the resulting URL (e.g. `wa.me/5491100000000?text=...` from the fixture seed).

## References

- `references/message-format.md` — exact template + real encoded URL examples from `utils.test.js`.
- Repo: `pages/cart.jsx`, `lib/utils/utils.js`, `tests/e2e/order-flow.spec.js`.