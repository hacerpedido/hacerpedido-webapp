import "server-only";

import { shops } from "#db/schema";
import { getDb } from "#lib/db/client";

import { eq } from "drizzle-orm";

const bearerToken = /^Bearer[ \t]+([^ \t]+)$/i;

/**
 * Resolve the shop addressed by an editor bearer token.
 *
 * A token is only useful when it identifies exactly one shop. The query is
 * deliberately capped at two rows so duplicate tokens cannot cause an
 * unbounded lookup, and are treated as unauthorized instead.
 */
export async function authorizeEditorRequest(
  request: Request,
): Promise<string | null> {
  const authorization = request.headers.get("authorization")?.trim();
  const match = authorization?.match(bearerToken);
  if (!match) return null;

  try {
    const resolved = await getDb()
      .select({ id: shops.id })
      .from(shops)
      .where(eq(shops.typeformtoken, match[1]))
      .limit(2);

    const id = resolved[0]?.id;
    return resolved.length === 1 && typeof id === "string" ? id : null;
  } catch {
    // Authorization failures, including database failures, fail closed.
    return null;
  }
}
