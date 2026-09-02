-- 0002_database_objects.sql
-- Database objects that Drizzle cannot model, replicated from production
-- (formerly part of 0001_baseline.js):
--   * trigger_set_timestamp() + set_timestamp triggers on shops/products
--   * rls_auto_enable() (replicated as-is; the Supabase event trigger that
--     calls it is NOT created here — see compose/docs RLS parity rules)
--
-- Fresh databases run this migration. Production already has these objects,
-- so the guarded adoption records it as applied AFTER fingerprint verification
-- without executing it. Statements are written idempotently so a partially
-- migrated database can catch up safely.

-- ==== trigger_set_timestamp() ============================================

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$fn$;

-- ==== set_timestamp triggers ==============================================

DROP TRIGGER IF EXISTS set_timestamp ON public.shops;
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp ON public.products;
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

-- ==== rls_auto_enable() ====================================================

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
