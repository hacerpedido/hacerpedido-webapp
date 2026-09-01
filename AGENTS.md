# AGENTS.md

Contexto para agentes de IA que trabajan en este repositorio (Claude Code, opencode, Cursor, Gemini, Copilot, Codex). Conocimiento situacional más fino en las skills de `.agents/skills/`; guía humana en [README.md](README.md).

## Proyecto

HacerPedido: webapp (Next.js + React) donde clientes arman un pedido desde la vidriera de un local y lo envían por WhatsApp (`wa.me` con mensaje pre-armado). Los comercios gestionan su página vía un token de Typeform.

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
| Tooling | TypeScript (`tsconfig.json`, `typecheck`), Biome (format/lint), Lefthook (pre-commit) |
| Testing | Jest 26 (unit), Playwright (E2E) |

## Convenciones críticas

- **UI web con CSS Modules**: cada componente visual debe usar un archivo `*.module.css` junto al componente e importar sus clases como `styles`. Usá `className={styles.nombre}` y variables CSS para valores dinámicos; no agregues estilos globales.
- **Estado**: CartContext con `useReducer` + persistencia en localStorage (`CartProvider` en `pages/_app.tsx`, `useCart` hook). No hay Redux.
- **API**: axios con baseURL al backend REST externo; rutas internas en `pages/api/`.
- **WhatsApp/teléfonos**: números argentinos. **Siempre** normalizá con `sanitizeWhatsAppNumber()` antes de armar un link `wa.me` (reglas 54 + 0/9). Ver skill `whatsapp-order`.
- **Imágenes**: upload/delete S3 vía `lib/utils/aws-s3.ts`, endpoints en `pages/api/image-upload.ts` y `image-delete.ts`.

## Mapa del repo

```
pages/
  index.tsx                 Home: locales por categoría
  [slug].tsx                Página pública del local
  [...params].tsx           Catch-all dinámico
  cart.tsx                  Checkout → genera link wa.me
  api/shop/home.ts          Shops por categoría
  api/shop/[slug].ts        Shop por slug
  api/shop/by-token.ts      Gestión del local vía token (EditShop)
  api/image-upload.ts       Upload S3
  api/image-delete.ts       Delete S3
  _app.tsx                  CartProvider wrapper
  _document.tsx, _error.tsx
components/
  Home/                     HomeHeader, HomeFilterBar, ShopCard
  Shop/                     ShopView, ShopHeader, ShopFooter, Product, ProductList, ProductAmountPopup, ShopNotes
  Cart/                     Header, Form, Product, ProductList
  EditShop/                 EditShop, EditProducts, UploadImage
  primitivas                Input, Form, Switch, MessageBox, ShopInput, Loading, Divider, DecoratedLabel
lib/
  api/                      index.ts (axios baseURL), shops.ts
  context/                CartContext (useReducer + localStorage)
  utils/                    TypeScript helpers (WhatsApp, prices, products, shops, categories, S3)
  hooks/                    use_width.ts
  graphql/                  shop.ts (legacy, Apollo comentado)
db/
  migrations/0001_baseline.js   shops + products, triggers, RLS, extensiones
tests/
  unit                      Tests Jest junto al código (algunos aún JS/JSX)
  e2e/                      Specs TypeScript: order-flow, cart-persistence, cart-validation, admin-flow, fixtures/
assets/                     colors.ts, theme.ts, backgrounds.ts
public/                     manifest.json, favicon, logos, og_image.jpg, robots.txt
docs/superpowers/           Documentación
```

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm install` / `pnpm dev` | Instalar dependencias / iniciar el servidor de desarrollo (alternativas a npm) |
| `npm run dev` | Dev server (puerto 3000; `PORT=3001 npm run dev` para otro) |
| `npm run build` / `npm run start` | Build / servir producción |
| `npm test` | Jest (unit: `lib/**/*.test.js`) |
| `npm run test:e2e` | Playwright E2E. Bootea `docker compose` (Postgres 17.6, puerto 54329), corre migraciones + seed, build & sirve la app (`npm run build && npm run start`), baseURL `http://127.0.0.1:3001` |
| `npm run test:e2e:install` | Instala Chromium |
| `npm run lint` | Biome lint (`.`) |
| `npm run db:migrate` / `db:migrate:make` / `db:rollback` | Knex migrations (`./db/migrations`) |
| `npm run db:seed:e2e` | Knex seed (`./tests/e2e/fixtures/seeds`) |
| `npm run format` | Biome format sobre los archivos soportados |
| `npm run format:check` | Verifica el formato con Biome |
| `npm run typecheck` | Verifica los tipos con TypeScript |
| `npm run check` | Verifica formato, lint e imports con Biome |

Notas de entorno:
- Usar **Node 22** (declarado en `.tool-versions` y en CI). Next.js 10 requiere `NODE_OPTIONS=--openssl-legacy-provider`, ya incluido en los scripts.
- E2E: overrides `PLAYWRIGHT_TEST_BASE_URL` (app desplegada, saltea compose) y `PG_CONNECTION_STRING` (base externa).

## Variables de entorno

Solo nombres — nunca imprimas/commitees valores:

`PG_CONNECTION_STRING` (requerida para db/migraciones/E2E), `HP_AWS_ACCESS_KEY_ID`, `HP_AWS_SECRET_ACCESS_KEY`, `HP_AWS_IMAGES_BUCKET`, `NEXT_PUBLIC_IMAGE_BUCKET_URL`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`.

## Expectativas de testing

- Jest para lógica pura (`lib/utils/`, `lib/context/`) y API (`tests/unit/`) — mantené verdes los tests existentes al tocar helpers.
- Playwright E2E para journeys: el flujo de pedido **intercepta `wa.me`** (`page.route('https://wa.me/**')` + `waitForURL`, ver `order-flow.spec.ts`).
- Biome es el formatter y linter del repositorio; Lefthook ejecuta `biome check --write` sobre archivos staged antes de cada commit.
- Antes de terminar una tarea con tests: `npm run lint` + `npm test`. E2E requiere Docker; si no está disponible, avisá que no se corrió.

## GitHub issues

- GitHub is the source of truth for the project issue list. Search existing issues before creating a new one: `gh issue list --state all` and `gh issue list --search "<terms>"`.
- Use the GitHub CLI for every issue operation. Do not create or modify issues through another interface.
- Check the repository's current labels with `gh label list` before creating or editing an issue. Use only labels that already exist; do not invent label names.
- Create issues with `gh issue create --title "..." --body "..." --label "<existing-label>"`.
- Modify issues with `gh issue edit <number>`, and close them with `gh issue close <number>` when the work is complete.
- Use the exact priority labels configured in the repository, such as `priority-low`, `priority-medium`, or `priority-high`.
- Include the issue number in the implementation context and link the completing pull request or commit before closing the issue.
- Pull requests must target `master` and link the relevant issue with `Closes #<number>` (or an equivalent GitHub closing keyword).
- This repository does not require `status:approved` or `type:*` labels for pull requests. Use only labels that exist when labeling issues or pull requests.

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
