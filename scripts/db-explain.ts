#!/usr/bin/env node
/**
 * EXPLAIN ANALYZE harness for the hot shop reads (issue #222).
 *
 * Connects to the database pointed to by PG_CONNECTION_STRING (loaded from
 * .env* like the rest of the db scripts) and prints the actual execution plan
 * for each public/editor read the application issues:
 *
 *   1. Public catalog by category              -> getPublicShops
 *   2. Public shop and its products by slug    -> getPublicShop (LEFT JOIN)
 *   3. Editor shop lookup by typeformtoken     -> getShopByToken
 *
 * Each probe also asserts that the expected index from
 * 0001_catalog_indexes.sql appears in the plan:
 *
 *   - idx_shops_public_category_updated_at
 *   - shops_slug_key + idx_products_shopid_itemnumber
 *   - idx_shops_typeformtoken
 *
 * Usage:
 *
 *   pnpm run db:explain
 *   PG_CONNECTION_STRING=... pnpm run db:explain
 *
 * Exit code is non-zero when any probe misses its expected index, which lets
 * CI/local checks catch missing indexes after a migration drift.
 */

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

if (!process.env.PG_CONNECTION_STRING) {
  throw new Error("PG_CONNECTION_STRING is required to run db:explain");
}

interface PoolLike {
  query: (
    text: string,
    params?: unknown[],
  ) => Promise<{ rows: Array<Record<string, unknown>> }>;
  end: () => Promise<void>;
}

// pg has no bundled type declarations; the same `require` pattern as
// scripts/db-migrate.ts and lib/db/pool.ts keeps the project consistent.
const { Pool } = require("pg") as {
  Pool: new (config: { connectionString: string }) => PoolLike;
};

const pool = new Pool({ connectionString: process.env.PG_CONNECTION_STRING });

interface Probe {
  /** Short label printed above the plan. */
  title: string;
  /** The hand-crafted query (parameterized) that mirrors the helper's SQL. */
  sql: string;
  /** Bind values — placeholders that keep the plans portable across slugs. */
  params: unknown[];
  /** Index name required by 0001_catalog_indexes.sql. */
  expectedIndex: string;
  /** Optional note clarifying why a probe expects a particular index. */
  hint?: string;
}

const probes: Probe[] = [
  {
    title: "Public catalog by category",
    sql: `
      SELECT id, name, slug, region, category, address, notes, opentimes,
             deliverycost, visibility, logo, background,
             ordersphonenumber, orderswhatsappnumber
        FROM shops
       WHERE visibility = 'public' AND category = $1
       ORDER BY updated_at DESC
    `,
    params: ["Comida"],
    expectedIndex: "idx_shops_public_category_updated_at",
  },
  {
    title: "Public shop by slug + LEFT JOIN products",
    sql: `
      SELECT s.id, s.name, s.slug, s.region, s.category, s.address, s.notes,
             s.opentimes, s.deliverycost, s.visibility, s.logo, s.background,
             s.ordersphonenumber, s.orderswhatsappnumber,
             p.id            AS product_id,
             p.name          AS product_name,
             p.category      AS product_category,
             p.price         AS product_price,
             p.description   AS product_description,
             p.itemnumber    AS product_itemnumber
        FROM shops s
        LEFT JOIN products p ON p.shopid = s.id
       WHERE s.slug = $1 AND s.visibility = 'public'
       ORDER BY p.itemnumber ASC
    `,
    params: ["probe-public-slug"],
    expectedIndex: "idx_products_shopid_itemnumber",
    hint: "Shop row uses the unique shops_slug_key; products join must read through idx_products_shopid_itemnumber.",
  },
  {
    title: "Editor shop lookup by typeformtoken + LEFT JOIN products",
    sql: `
      SELECT s.id, s.name, s.slug, s.region, s.category, s.address, s.notes,
             s.opentimes, s.deliverycost, s.visibility, s.logo, s.background,
             s.ordersphonenumber, s.orderswhatsappnumber, s.typeformtoken,
             p.id            AS product_id,
             p.name          AS product_name,
             p.category      AS product_category,
             p.price         AS product_price,
             p.description   AS product_description,
             p.itemnumber    AS product_itemnumber
        FROM shops s
        LEFT JOIN products p ON p.shopid = s.id
       WHERE s.typeformtoken = $1
       ORDER BY p.itemnumber ASC
    `,
    params: ["probe-editor-token"],
    expectedIndex: "idx_shops_typeformtoken",
  },
];

function renderPlan(rows: Array<Record<string, unknown>>): string {
  return rows.map((row) => String(row["QUERY PLAN"] ?? "")).join("\n");
}

async function explain(probe: Probe): Promise<{ ok: boolean; plan: string }> {
  const statement = `EXPLAIN (ANALYZE, BUFFERS) ${probe.sql}`;
  const { rows } = await pool.query(statement, probe.params);
  const plan = renderPlan(rows);
  const ok = plan.includes(probe.expectedIndex);
  return { ok, plan };
}

async function main(): Promise<void> {
  let failed = 0;

  console.log(
    "\nEXPLAIN ANALYZE for the hot shop reads (#222).\n" +
      "Each plan should reference the secondary index added by 0001_catalog_indexes.sql.\n",
  );

  for (const probe of probes) {
    console.log(`\u25B6 ${probe.title}`);
    console.log(`  expected index: ${probe.expectedIndex}`);
    if (probe.hint) console.log(`  note: ${probe.hint}`);

    try {
      const { ok, plan } = await explain(probe);
      console.log(plan);
      console.log(
        ok
          ? "  \u2713 index referenced in plan"
          : "  \u2717 index NOT referenced in plan",
      );
      if (!ok) failed += 1;
    } catch (error: unknown) {
      console.error(`  \u2717 failed to run EXPLAIN: ${String(error)}`);
      failed += 1;
    }
    console.log("");
  }

  await pool.end();

  if (failed > 0) {
    console.error(
      `${failed}/${probes.length} probe(s) missed their expected index. ` +
        "Re-run pnpm run db:migrate to apply 0001_catalog_indexes.sql.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(`All ${probes.length} probe(s) referenced the expected index.`);
}

main().catch(async (error: unknown) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exitCode = 1;
});
