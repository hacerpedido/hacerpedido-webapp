-- 0003_pin_search_path.sql
-- Pins the search_path used by public.trigger_set_timestamp() so trigger
-- executions cannot resolve relations/functions through a caller-controlled
-- search_path (issue #134). The pinned representation (proconfig =
-- {search_path=pg_catalog, public}) is one of the approved fingerprints in
-- scripts/adopt-baseline.ts and is asserted by the database contract tests.
--
-- Runs on every database, including production after guarded adoption.

ALTER FUNCTION public.trigger_set_timestamp()
SET search_path = pg_catalog, public;
