/**
 * Typed Drizzle client over the shared PostgreSQL pool.
 *
 * Replaces direct raw-SQL access through `getPool()` for server modules
 * (read model, editor mutations, image mutations). The `pg` driver keeps
 * owning the connection pool; Drizzle provides the typed query layer and the
 * schema in `db/schema.ts` is the source of truth for column names.
 *
 * The pool is created lazily (single shared instance) and the client is a
 * lazy singleton on top of it, so modules can import `getDb()` safely in
 * test and serverless contexts.
 */

import * as schemaNamespace from "#db/schema";

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { getPool } from "./pool";

type Database = NodePgDatabase<typeof schemaNamespace>;

let database: Database | undefined;

export function getDb(): Database {
  if (!database) {
    database = drizzle({ client: getPool(), schema: schemaNamespace });
  }
  return database;
}
