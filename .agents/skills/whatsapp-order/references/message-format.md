# WhatsApp message format

Built in `lib/utils/utils.ts` by `generateWhatsappMessage(formData, products)`.

## Template (with user data)

```
¡Hola! soy *NAME* y quiero hacer un pedido via HacerPedido 💪
[blank line]
📍 *Mi dirección:* ADDRESS        ← optional: only when address is non-empty
📝 *Notas:* NOTES                ← optional: only when notes is non-empty
[blank line]
*Mi pedido:*
*CATEGORY*
✅ AMOUNT x PRODUCTNAME
✅ AMOUNT x PRODUCTNAME
*OTHER-CATEGORY*
✅ AMOUNT x PRODUCTNAME
```

Notes:

- `generateSimpleWhatsappMessage()` (no user data) is just: `¡Hola! Quiero hacer un pedido via HacerPedido 💪`.
- Intro prefix: `¡Hola! soy *NAME* y quiero hacer un pedido via HacerPedido 💪\n\n`.
- Address line: `📍 *Mi dirección:* {address}\n` only if set.
- Notes line: `📝 *Notas:* {notes}\n` only if set.
- Order heading: `\n*Mi pedido:*\n` always appended.
- `categoryProducts`: `✅ {amount} x {name}` per product.
- `productListForMessage`: `*{category.name}*\n{categoryProducts}` joined by `\n`.
- Final piece assembled as `[intro, addressStr, notesStr, order].join("")`, then `encodeURIComponent` into `https://wa.me/<number>?text=<encoded>`.

## Real encoded example (from `lib/utils/utils-phone-whatsapp.test.js`)

Message: `¡Hola! soy *Ana* y quiero hacer un pedido via HacerPedido 💪 📍 *Mi dirección:* Av. Siempre Viva 123 *Mi pedido:* *Comida* ✅ 2 x Ñoquis *Bebidas* ✅ 1 x Café ☕ ✅ 3 x Agua`

Encoded URL fragment:

```
https://wa.me/549223000000?text=%C2%A1Hola!%20soy%20*Ana*%20y%20quiero%20hacer%20un%20pedido%20via%20HacerPedido%20%F0%9F%92%AA%0A%0A%F0%9F%93%8D%20*Mi%20direcci%C3%B3n%3A*%20Av.%20Siempre%20Viva%20123%0A%0A*Mi%20pedido%3A*%0A*Comida*%0A%E2%9C%85%202%20x%20%C3%91oquis%0A*Bebidas*%0A%E2%9C%85%201%20x%20Caf%C3%A9%20%E2%98%95%0A%E2%9C%85%203%20x%20Agua
```

## Argentina number normalization (`sanitizeWhatsAppNumber`)

| Input | Output |
|---|---|
| `+54223000000` | `549223000000` |
| `+540223000000` | `549223000000` |
| `549223000000` | `549223000000` (unchanged) |
| Non-AR (e.g. `+1000000000`) | unchanged digit string |

E2E seed shop uses `orderswhatsappnumber: "+5491100000000"` → asserted URL starts `wa.me/5491100000000?text=`.
