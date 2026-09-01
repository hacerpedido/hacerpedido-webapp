# HacerPedido WebApp

HacerPedido es una aplicación web (Next.js + React) que permite a negocios locales recibir pedidos por WhatsApp. Los clientes navegan la vidriera de un local, arman su pedido en un carrito y lo envían como mensaje de WhatsApp pre-armado, sin registrarse.

Este repositorio es la **webapp** (frontend + API routes internas). Los datos se sirven desde un backend REST externo (`https://backend-restapi.hacerpedido.com:5001`) y una base PostgreSQL.

| | |
|---|---|
| **Frontend** | Next.js 15.5.25 (SSR/SSG), React 19.2.8 |
| **Estado** | CartContext (useReducer + localStorage) |
| **Datos** | PostgreSQL 17.6 (Supabase) vía Knex |
| **Pedidos** | Integración WhatsApp (`wa.me` con mensaje pre-armado) |
| **Testing** | Jest (unit) + Playwright (E2E), with migrated tests in TypeScript |
| **Tooling** | TypeScript (`tsconfig.json`) + Biome (format/lint) |
| **CI** | GitHub Actions (lint, unit, E2E) |
| **Estado del proyecto** | En desarrollo activo — ver issues abiertos |

> Instrucciones para agentes de IA: ver [AGENTS.md](AGENTS.md).

## Arquitectura

- La aplicación está migrada a TypeScript: las páginas, rutas API y componentes usan `.ts`/`.tsx`; los tests E2E migrados también usan `.ts`.
- **Páginas SSR** en `pages/`: home (`index.tsx`, locales por categoría), shop público (`[slug].tsx`), checkout (`cart.tsx` → WhatsApp), página de gestión para comercios (`by-token.ts` + `components/EditShop/`).
- **API routes** en `app/api/` y `pages/api/`: `shop/editor`, `images`, `shop/home`, `shop/[slug]`, `shop/by-token`.
- **Backend externo**: axios apunta a `https://backend-restapi.hacerpedido.com:5001` (config en `lib/api/index.ts`).
- **Estilos**: componentes web con CSS Modules colocados junto al componente (`Component.tsx` + `Component.module.css`).

### Flujo de pedido por WhatsApp

1. El cliente agrega productos al carrito en la página del local (`[slug].tsx`).
2. En `cart.tsx` completa nombre, dirección y notas.
3. `generateWhatsappURL(orderswhatsappnumber, formData, productsByCategory)` en `lib/utils/utils.ts` normaliza el número (ver `sanitizeWhatsAppNumber`, reglas de Argentina) y arma `https://wa.me/<número>?text=<mensaje codificado>`.
4. El mensaje incluye introducción, dirección, notas y el pedido agrupado por categoría (`✅ 2 x Ñoquis`).
5. El comercio recibe el pedido en su WhatsApp.

## Estructura del proyecto

```
pages/            Páginas SSR y API routes
  api/            shop/home, shop/[slug], shop/by-token
  [slug].tsx      Página pública del local
  cart.tsx        Checkout → WhatsApp
components/       UI (CSS Modules + Bootstrap)
  Home/ Shop/ Cart/ EditShop/   + primitivas (Input, Form, Switch, MessageBox…)
lib/              Lógica de aplicación
    api/            Cliente axios (backend REST externo, TypeScript)
    context/        CartContext (estado del carrito con useReducer + localStorage)
    utils/          Helpers TypeScript: WhatsApp, teléfonos, precios, productos, categorías, S3
    hooks/          use_width
db/               Migraciones Knex (baseline shops/products)
tests/            Unit (Jest, junto al código) y E2E (Playwright)
assets/ public/   Colores/tema/fondos; manifest, favicons, OG image
docs/             Documentación
```

## Puesta en marcha

### Requisitos

- Node.js 22 (el CI y `.tool-versions` usan 22)
- pnpm 11.25.0
- **Docker** (para la base local y E2E; levanta PostgreSQL 17.6 con `pg_stat_statements`)

### Variables de entorno

Copiá `.env.example` a `.env.local` (o crealo) en la raíz. Para desarrollo local,
el valor de `PG_CONNECTION_STRING` del ejemplo funciona con `compose.dev.yaml`:

| Variable | Para qué sirve | ¿Requerida? |
|---|---|---|
| `PG_CONNECTION_STRING` | Conexión PostgreSQL (Knex, migraciones, override E2E) | Sí (db) |
| `HP_AWS_ACCESS_KEY_ID` | Upload de imágenes a S3 | Solo uploads |
| `HP_AWS_SECRET_ACCESS_KEY` | Upload de imágenes a S3 | Solo uploads |
| `HP_AWS_IMAGES_BUCKET` | Bucket S3 de imágenes | Solo uploads |
| `NEXT_PUBLIC_IMAGE_BUCKET_URL` | URL pública del bucket | Solo imágenes |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | Monitoreo de errores (deshabilitado en dev) | No |

> Nunca commitees valores de secretos. `Sentry` se desactiva automáticamente en desarrollo.

### Instalación y dev

```bash
pnpm install
pnpm run db:setup   # Docker + migraciones + datos de desarrollo
pnpm run dev        # http://localhost:3000
```

`pnpm-lock.yaml` es el lockfile canónico del proyecto; usá pnpm para instalar
dependencias y ejecutar los scripts.

### Base de datos

```bash
pnpm run db:migrate       # Aplica migraciones (knex migrate:latest)
pnpm run db:migrate:make  # Crea una nueva migración
pnpm run db:migrate:status # Muestra el estado de las migraciones
pnpm run db:rollback      # Revierte la última
pnpm run db:create         # Crea/inicia la base local (idempotente)
pnpm run db:seed           # Levanta PostgreSQL y carga datos sintéticos
pnpm run db:seed:test      # Fixtures E2E (base de test)
pnpm run db:up             # Levanta PostgreSQL local en 54328
pnpm run db:down           # Detiene PostgreSQL local
pnpm run db:logs           # Sigue los logs de PostgreSQL
pnpm run db:check          # Comprueba que PostgreSQL responde
pnpm run db:reset          # Borra el volumen local y recrea todo
```

La base de desarrollo usa `compose.dev.yaml` y el puerto **54328**. La base E2E
usa `compose.e2e.yaml`, el puerto **54329** y fixtures deterministas; son bases
separadas. `db:reset` elimina permanentemente los datos del volumen local:
usalo solo cuando quieras empezar de cero. No requiere `psql` instalado en el
host; los checks se ejecutan dentro del contenedor.

La migración `0001_baseline` crea `shops` y `products` y **no es reversible** (`down()` lanza error a propósito). Requiere extensiones `uuid-ossp`, `pgcrypto` y `pg_stat_statements` (esta última debe estar pre-cargada — ver `compose.e2e.yaml`). Compatible con Postgres 17.6.

## Testing

### Unit (Jest)

```bash
pnpm test
```

Pruebas junto al código: `lib/utils/*.test.js`, `lib/context/*.test.jsx`.

### E2E (Playwright)

```bash
pnpm run test:e2e
```

Levanta automáticamente (vía `global-setup`) el stack Docker Compose con PostgreSQL 17.6, aplica migraciones + seed, hace build de la app, la sirve y corre los journeys en Chromium:

- `tests/e2e/order-flow.spec.ts` — flujo de pedido que intercepta `wa.me` y valida el mensaje
- `tests/e2e/cart-persistence.spec.ts` — carrito persiste entre sesiones (multi-producto)
- `tests/e2e/admin-flow.spec.ts` — gestión del local por token

Overrides útiles: `PLAYWRIGHT_TEST_BASE_URL` (app ya desplegada, saltea el setup local) y `PG_CONNECTION_STRING` (base externa en vez del compose local).

Primera vez: `pnpm run test:e2e:install` (instala Chromium).

## CI

`.github/workflows/ci.yml` corre en cada push y pull request: instala con pnpm usando el lockfile congelado, ejecuta los checks de calidad y los tests E2E en jobs separados, y sube el reporte de Playwright si falla.

## Scripts disponibles

| Script | Descripción |
|---|---|
| `pnpm run dev` | Dev server (puerto 3000; `PORT=3001 pnpm run dev` para otro) |
| `pnpm run build` | Producción build |
| `pnpm run start` | Servir build de producción |
| `pnpm test` | Unit tests (Jest) |
| `pnpm run test:e2e` | E2E (Playwright + Docker) |
| `pnpm run test:e2e:install` | Instala Chromium |
| `pnpm run lint` | Biome lint |
| `pnpm run db:migrate` / `db:migrate:make` / `db:migrate:status` / `db:rollback` | Migraciones Knex |
| `pnpm run db:seed` | Seed de desarrollo |
| `pnpm run db:seed:test` / `db:seed:e2e` | Seed E2E |
| `pnpm run db:create` / `db:up` / `db:down` / `db:logs` / `db:check` | Operar DB local |
| `pnpm run db:setup` / `db:reset` | Preparar / recrear DB local |
| `pnpm run format` | Formatea código con Biome |
| `pnpm run format:check` | Verifica el formato con Biome |
| `pnpm run typecheck` | Verifica los tipos con TypeScript |
| `pnpm run check` | Verifica formato, lint e imports con Biome |

## Deploy

Apunta a Vercel: configurá las variables de entorno listadas arriba (Sentry se activa en producción). No hay URLs de deploy públicas documentadas en este repo.

## Troubleshooting

- **Node.js**: usá Node 22, tal como declara `.tool-versions` y el workflow de CI.
- **`pnpm run test:e2e` falla en global-setup**: Docker debe estar corriendo (el setup hace `docker compose down --volumes && up --detach --wait` antes de migrar/seedear). Puerto 54329 ocupado → cambialo en `tests/e2e/fixtures/database.ts` y `compose.e2e.yaml`.
- **PostgreSQL local**: `pg_stat_statements` debe estar en `shared_preload_libraries` (como en `compose.e2e.yaml`).

## Contribuir

- Commits en formato [Conventional Commits](https://www.conventionalcommits.org/).
- Corré `pnpm run lint` y `pnpm test` antes de abrir un PR (E2E si tocás flujos).
- Para cada componente visual, colocá los estilos en un archivo `*.module.css` junto al componente e importalos como `styles`.
- Usá nombres de clase semánticos en kebab-free camelCase (`containerLogo`, `shopName`) y aplicalos con `className={styles.nombre}`.
- Preferí variables CSS para valores que cambian desde React y mantené los estados visuales (`:hover`, `:focus`) en el módulo.
- Agentes de IA: leé [AGENTS.md](AGENTS.md) y usá las skills en `.agents/skills/` cuando apliquen.
