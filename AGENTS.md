# AGENTS.md

Contexto para agentes de IA que trabajan en este repositorio (Claude Code, opencode, Cursor, Gemini, Copilot, Codex). Conocimiento situacional más fino en las skills de `.agents/skills/`; guía humana en [README.md](README.md).

## Proyecto

HacerPedido: webapp (Next.js + React Native Web) donde clientes arman un pedido desde la vidriera de un local y lo envían por WhatsApp (`wa.me` con mensaje pre-armado). Los comercios gestionan su página vía un token de Typeform.

Convenciones de idioma:
- UI/copy de producto: **español** (Argentina).
- Commits, docs, tests, mensajes de este archivo: **inglés**.
- No agregues atribución de IA ("Co-Authored-By") a los commits.

## Stack (versiones fijadas)

| Capa | Tecnología |
|---|---|
| Framework | Next.js 10.2.3 (SSR/SSG), React 16.14 |
| UI | CSS Modules + Bootstrap 4.6 (semantic HTML) |
| Estado | CartContext (useReducer + localStorage) |
| HTTP | axios (baseURL `https://backend-restapi.hacerpedido.com:5001`) |
| DB | PostgreSQL 17.6 (Supabase) vía Knex |
| Files | AWS SDK v2 → S3 |
| Observabilidad | @sentry/nextjs (deshabilitado en dev) |
| Testing | Jest 26 (unit), Playwright (E2E) |

## Convenciones críticas

- **UI web con CSS Modules**: cada componente visual debe usar un archivo `*.module.css` junto al componente e importar sus clases como `styles`. Usá `className={styles.nombre}` y variables CSS para valores dinámicos; no agregues estilos globales.
- **Estado**: CartContext con `useReducer` + persistencia en localStorage (`CartProvider` en `pages/_app.jsx`, `useCart` hook). No hay Redux.
- **API**: axios con baseURL al backend REST externo; rutas internas en `pages/api/`.
- **WhatsApp/teléfonos**: números argentinos. **Siempre** normalizá con `sanitizeWhatsAppNumber()` antes de armar un link `wa.me` (reglas 54 + 0/9). Ver skill `whatsapp-order`.
- **Imágenes**: upload/delete S3 vía `lib/utils/aws-s3.js`, endpoints en `pages/api/image-upload.js` y `image-delete.js`.

## Mapa del repo

```
pages/
  index.jsx                 Home: locales por categoría
  [slug].jsx                Página pública del local
  [...params].jsx           Catch-all dinámico
  cart.jsx                  Checkout → genera link wa.me
  api/shop/home.js          Shops por categoría
  api/shop/[slug].js        Shop por slug
  api/shop/by-token.js      Gestión del local vía token (EditShop)
  api/image-upload.js       Upload S3
  api/image-delete.js       Delete S3
  _app.jsx                  CartProvider wrapper
  _document.jsx, _error.js
components/
  Home/                     HomeHeader, HomeFilterBar, ShopCard
  Shop/                     ShopView, ShopHeader, ShopFooter, Product, ProductList, ProductAmountPopup, ShopNotes
  Cart/                     Header, Form, Product, ProductList
  EditShop/                 EditShop, EditProducts, UploadImage
  primitivas                Input, Form, Switch, MessageBox, ShopInput, Loading, Divider, DecoratedLabel
lib/
  api/                      index.js (axios baseURL), shops.js
  context/                CartContext (useReducer + localStorage)
  utils/                    utils.js (toTitleCase, sanitizeWhatsAppNumber, generateWhatsappURL, sanitizePrice, …), products.js, shops.js, categories.js, categoriesHelper.js, aws-s3.js
  hooks/                    use_width.js
  graphql/                  shop.js (legacy, Apollo comentado)
db/
  migrations/0001_baseline.js   shops + products, triggers, RLS, extensiones
tests/
  unit                      *.test.js junto al código (utils, products, reducers)
  e2e/                      order-flow.spec.js, cart-persistence.spec.js, admin-flow.spec.js, global-setup.js, global-teardown.js, fixtures/
assets/                     colors.js, theme.js, backgrounds.js
public/                     manifest.json, favicon, logos, og_image.jpg, robots.txt
docs/superpowers/           Documentación
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Dev server (puerto 3000; `PORT=3001 npm run dev` para otro) |
| `npm run build` / `npm run start` | Build / servir producción |
| `npm test` | Jest (unit: `lib/**/*.test.js`) |
| `npm run test:e2e` | Playwright E2E. Bootea `docker compose` (Postgres 17.6, puerto 54329), corre migraciones + seed, build & sirve la app (`npm run build && npm run start`), baseURL `http://127.0.0.1:3000` |
| `npm run test:e2e:install` | Instala Chromium |
| `npm run lint` | ESLint (`.`) |
| `npm run db:migrate` / `db:migrate:make` / `db:rollback` | Knex migrations (`./db/migrations`) |
| `npm run db:seed:e2e` | Knex seed (`./tests/e2e/fixtures/seeds`) |
| `npm run prettier` | Prettier sobre `**/*.js?` |
| `npm run import-data` / `npm run svg` | ⚠️ Rotos: apuntan a paths legacy `src/` que no existen |

Notas de entorno:
- Node requiere `NODE_OPTIONS=--openssl-legacy-provider` (ya incluido en los scripts) con Node 17+.
- Usar **Node 22** (CI y `.tool-versions`), ignorar `.nvmrc` (12.4.0, desactualizado).
- E2E: overrides `PLAYWRIGHT_TEST_BASE_URL` (app desplegada, saltea compose) y `PG_CONNECTION_STRING` (base externa).

## Variables de entorno

Solo nombres — nunca imprimas/commitees valores:

`PG_CONNECTION_STRING` (requerida para db/migraciones/E2E), `HP_AWS_ACCESS_KEY_ID`, `HP_AWS_SECRET_ACCESS_KEY`, `HP_AWS_IMAGES_BUCKET`, `NEXT_PUBLIC_IMAGE_BUCKET_URL`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`.

## Expectativas de testing

- Jest para lógica pura (`lib/utils/`, `lib/context/`) — mantené verdes los tests existentes al tocar helpers.
- Playwright E2E para journeys: el flujo de pedido **intercepta `wa.me`** (`page.route('https://wa.me/**')` + `waitForURL`, ver `order-flow.spec.js`).
- Antes de terminar una tarea con tests: `npm run lint` + `npm test`. E2E requiere Docker; si no está disponible, avisá que no se corrió.

## GitHub issues

- GitHub is the source of truth for the project issue list. Search existing issues before creating a new one: `gh issue list --state all` and `gh issue list --search "<terms>"`.
- Use the GitHub CLI for every issue operation. Do not create or modify issues through another interface.
- Check the repository's current labels with `gh label list` before creating or editing an issue. Use only labels that already exist; do not invent label names.
- Create issues with `gh issue create --title "..." --body "..." --label "<existing-label>"`.
- Modify issues with `gh issue edit <number>`, and close them with `gh issue close <number>` when the work is complete.
- Use the exact priority labels configured in the repository, such as `priority-low`, `priority-medium`, or `priority-high`.
- Include the issue number in the implementation context and link the completing pull request or commit before closing the issue.

## Skills del proyecto

Cargá la skill relevante cuando la tarea matchee su descripción (progressive disclosure — solo cargás lo necesario):

- `knex-migrations` — migraciones, seed, schema shops/products
- `e2e-playwright` — correr/armar E2E, stack compose
- `whatsapp-order` — flujo de pedido, números, links wa.me, cart
- `s3-images` — upload/delete de imágenes, AWS

## Guardrails

- Conventional Commits; sin atribución de IA; sin commits vacíos ni force-push.
- Migraciones: mantener compatibilidad con **Postgres 17.6** (sin `pgjwt`, `timescaledb`, `plv8`). La baseline 0001 **no es reversible**; `pg_stat_statements` debe estar pre-cargado (ver `compose.e2e.yaml`). RLS está habilitado en prod pero **deshabilitado en la base E2E** — no tomes decisiones de RLS asumiendo paridad total.
- Los datos sensibles (env, seed real) nunca van a un commit.
