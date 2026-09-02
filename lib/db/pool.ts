/**
 * Shared PostgreSQL connection pool for server modules.
 *
 * Single lazy singleton configured from `PG_CONNECTION_STRING`, replacing the
 * per-module pools that used to live in `app/api/images/route.ts`,
 * `lib/api/server-shops.ts`, and `lib/actions/shop-editor.ts`.
 *
 * The `pg` driver does not ship TypeScript declarations in this repository, so
 * this module exposes the minimal structural shape the consumers rely on and
 * loads the driver through `require` (same as the modules it replaces).
 */

export interface SharedQueryResult {
  // biome-ignore lint/suspicious/noExplicitAny: pg has no bundled types; consumers cast rows to their shapes.
  rows: any[];
  rowCount: number | null;
}

export interface SharedPoolClient {
  query: (text: string, params?: unknown[]) => Promise<SharedQueryResult>;
  release: () => void;
}

export interface SharedPool {
  query: (text: string, params?: unknown[]) => Promise<SharedQueryResult>;
  connect: () => Promise<SharedPoolClient>;
}

let pool: SharedPool | undefined;

export function getPool(): SharedPool {
  if (!pool) {
    const { Pool } = require("pg") as {
      Pool: new (config: { connectionString?: string }) => SharedPool;
    };
    pool = new Pool({
      connectionString: process.env.PG_CONNECTION_STRING,
    });
  }
  return pool;
}
