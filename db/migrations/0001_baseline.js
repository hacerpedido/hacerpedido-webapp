// 0001_baseline.js
// Baseline del schema real de producción (Supabase PostgreSQL 17.6), inferido
// del pg_dump original y VERIFICADO contra producción vía Supabase MCP
// (list_tables verbose + queries a pg_trigger/pg_proc/pg_event_trigger,
// project xpnthjdzqrnpgwzquszb, 2026-08-30).
//
// Verificación confirmada:
//  * Columnas, tipos y nullability de public.shops y public.products: 100% match.
//  * Default de id: uuid_generate_v1() en el schema `extensions` en prod; el
//    baseline usa la llamada sin calificar, que resuelve vía search_path.
//  * Extensions instaladas en prod: uuid-ossp 1.1, pgcrypto 1.3,
//    pg_stat_statements 1.11 (coinciden). pgjwt NO está instalado en prod.
//  * trigger_set_timestamp() y los triggers set_timestamp sobre ambas tablas:
//    coinciden.
//  * rls_auto_enable() existe en prod; el event trigger ensure_rls es de la
//    plataforma y NO se replica en E2E (decisión deliberada).
//  * knex_migrations está vacío en prod: el baseline nunca se aplicó allí.
//
// Decisiones deliberadas:
//  * pg_stat_statements requiere shared_preload_libraries; el ambiente E2E
//    debe preloadearla (ver compose.e2e.yaml).
//  * La función rls_auto_enable se replica tal cual existe en producción,
//    pero el event trigger de Supabase NO se crea aquí: en la base E2E el
//    rol no es superusuario y un RLS activo sin policies bloquearía todo.
//  * RLS en tablas: habilitado en prod, deshabilitado en E2E (decisión).
//  * Los índices id_products / id_shops que muestra el dashboard son los
//    índices implícitos de las PRIMARY KEY; no se crean explícitamente.

const SQL = `
-- ============ Extensions ============

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- uuid_generate_v1()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- funciones criptográficas
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- requiere preload
-- plpgsql 1.0 ya viene en pg_catalog.

-- ============ Tables ============

CREATE TABLE public.shops (
  id                        uuid        NOT NULL DEFAULT uuid_generate_v1(),
  name                      text        NOT NULL,
  slug                      text        NOT NULL,
  region                    text        NOT NULL,
  username                  text,
  category                  text,
  address                   text,
  notes                     text,
  ordersbyphoneorwhatsapp   text,
  delivery                  text,
  takeaway                  text,
  whatsappnumber            text,
  phonenumber               text,
  email                     text,
  submittedat               text,
  opentimes                 text,
  deliverycost              text,
  visibility                text,
  logo                      text,
  background                text,
  typeformtoken             text,
  ordersphonenumber         text,
  orderswhatsappnumber      text,
  created_at                timestamp without time zone DEFAULT now(),
  updated_at                timestamp without time zone DEFAULT now(),
  CONSTRAINT shops_pkey PRIMARY KEY (id),
  CONSTRAINT shops_slug_key UNIQUE (slug)
);

CREATE TABLE public.products (
  id           uuid   NOT NULL DEFAULT uuid_generate_v1(),
  category     text   NOT NULL,
  name         text   NOT NULL,
  description  text,
  price        text,
  shopid       uuid   NOT NULL,
  itemnumber   integer,
  created_at   timestamp without time zone DEFAULT now(),
  updated_at   timestamp without time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_shopid_fkey FOREIGN KEY (shopid)
    REFERENCES public.shops (id)
);

-- ============ Funciones y triggers ============

-- Actualiza updated_at en cada UPDATE.
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$fn$;

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

-- Habilita RLS automáticamente en tablas nuevas del schema public
-- (función replicada de producción; el event trigger NO se crea en E2E).
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$fn$;
`;

/** @param {import("knex").Knex} knex */
exports.up = (knex) => knex.raw(SQL);

exports.down = () => {
  throw new Error("0001_baseline is not reversible");
};
