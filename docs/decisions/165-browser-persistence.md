# Browser Persistence Decision

The application will keep `localStorage` for the small amount of client data
that still needs persistence after Redux removal. IndexedDB is not justified by
the current data size or access patterns.

## Current Inventory

| Data | Current storage | Production use | Decision |
|---|---|---|---|
| Cart form fields (`name`, `address`, `notes`) | `redux-persist` in `persist:root` | Not read by the cart form | Remove as dead state |
| Home shops list | `redux-persist` in `persist:root` | Refreshed from the API | Do not persist |
| Selected Home category | `redux-persist` in `persist:root` | Used by the Home filter | Keep only if UX requires it; use a small explicit key |
| Home scroll position | `redux-persist` in `persist:root` | Used for list restoration | Keep only if UX requires it; use a small explicit key |
| Product quantities | Redux memory state | Used during the current shop session | Keep ephemeral unless product persistence becomes a requirement |

There is no use of `sessionStorage`, cookies, or IndexedDB. The current
`persist:root` payload is small and contains no binary data or large catalog.

## Decision

Use direct `localStorage` access behind a small persistence utility after
`redux-persist` is removed. Read and write only from client-side effects or
event handlers; never access browser storage during server rendering.

IndexedDB is deferred because this application does not need its larger quota,
structured-clone values, indexes, or transactions. Its asynchronous API would
add hydration and error-handling complexity without improving the current
cart or Home experience.

## Migration Strategy

1. Remove the unused persisted `cart` slice and `redux-persist`.
2. Stop persisting the Home shops list.
3. Preserve selected category and scroll position only if regression tests show
   that the current behavior is required.
4. Use explicit versioned keys if those Home preferences remain persisted.
5. Remove the old `persist:root` key once the Redux migration is deployed.
6. Re-evaluate IndexedDB if the app adds offline catalogs, binary data, large
   client caches, or a requirement to persist product quantities across reloads.

## Verification

The Redux migration must verify that:

- Existing users do not get stale shop data from the old persisted list.
- The cart form behavior is unchanged, including reload behavior if it is
  intentionally supported.
- Server rendering never reads browser storage.
- A failed storage read or write does not block browsing or checkout.
