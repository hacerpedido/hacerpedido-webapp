"use server";

import type { Product } from "../types";
import {
  type ShopEditorInput,
  validateShopEditorInput,
} from "../validation/shop-editor";

// Next 14 exposes revalidatePath, while the legacy Pages deployment used by
// this repository does not. Keep the mutation usable in both runtimes.
function revalidateShopPath(path: string) {
  try {
    const { revalidatePath } = require("next/cache") as {
      revalidatePath?: (value: string) => void;
    };
    revalidatePath?.(path);
  } catch {
    // The Pages Router refreshes the editor explicitly after saving.
  }
}

type DbResult = { rowCount?: number; rows: Array<{ slug: string }> };
type DbClient = {
  connect: () => Promise<{
    query: (sql: string, params?: unknown[]) => Promise<DbResult>;
    release: () => void;
  }>;
};

let pool: DbClient | undefined;

function getPool() {
  if (!pool) {
    const { Pool } = require("pg");
    pool = new Pool({ connectionString: process.env.PG_CONNECTION_STRING });
  }
  if (!pool) throw new Error("Database pool was not initialized.");
  return pool;
}

export interface ShopEditorResult {
  message: string;
  error?: number;
}

export async function saveShopWithProductsAction(
  input: ShopEditorInput,
  products: Product[] | null,
): Promise<ShopEditorResult> {
  const payload = { ...input, products };
  const validationError = validateShopEditorInput(payload);
  if (validationError) return { message: validationError, error: 1 };

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const shop = await client.query(
      `UPDATE shops SET address=$1, deliverycost=$2, name=$3, notes=$4,
       opentimes=$5, ordersphonenumber=$6, orderswhatsappnumber=$7,
       updated_at=NOW() WHERE id=$8 AND typeformtoken=$9 RETURNING slug`,
      [
        input.address,
        input.deliverycost,
        input.name,
        input.notes,
        input.opentimes,
        input.ordersphonenumber,
        input.orderswhatsappnumber,
        input.id,
        input.token,
      ],
    );
    if (!shop.rowCount) {
      await client.query("ROLLBACK");
      return { message: "No autorizado para editar este comercio.", error: 1 };
    }

    if (products !== null) {
      await client.query("DELETE FROM products WHERE shopid=$1", [input.id]);
      for (const product of products) {
        await client.query(
          `INSERT INTO products (shopid, name, category, price, description, itemnumber)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            input.id,
            product.name,
            product.category ?? "",
            product.price ?? null,
            product.description ?? null,
            product.itemnumber ?? null,
          ],
        );
      }
    }
    await client.query("COMMIT");
    revalidateShopPath(`/${shop.rows[0].slug}`);
    return { message: "Tus cambios fueron guardados." };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return { message: "Error al grabar los datos del comercio.", error: 1 };
  } finally {
    client.release();
  }
}
