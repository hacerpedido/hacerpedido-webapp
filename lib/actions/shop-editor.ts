"use server";

import type { Product } from "../types";
import { getPool } from "../db/pool";
import {
  type ShopEditorInput,
  validateShopEditorInput,
} from "../validation/shop-editor";

// Keep the mutation usable when path revalidation is unavailable.
function revalidateShopPath(path: string) {
  try {
    const { revalidatePath } = require("next/cache") as {
      revalidatePath?: (value: string) => void;
    };
    revalidatePath?.(path);
  } catch {
    // The editor refreshes explicitly after saving when needed.
  }
}

export interface ShopEditorResult {
  message: string;
  error?: number;
}

export interface ShopEditorActionState extends ShopEditorResult {
  values?: Record<string, string>;
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

/** Adapter for React's useActionState/form action contract. */
export async function saveShopFormAction(
  _previous: ShopEditorActionState,
  formData: FormData,
): Promise<ShopEditorActionState> {
  const productsValue = formData.get("products");
  let products: Product[] | null = null;
  if (typeof productsValue === "string" && productsValue) {
    try {
      products = JSON.parse(productsValue);
    } catch {
      return { message: "Productos inválidos.", error: 1 };
    }
  }

  const input = Object.fromEntries(
    formData.entries(),
  ) as unknown as ShopEditorInput;
  delete (input as Record<string, unknown>).products;
  return {
    ...(await saveShopWithProductsAction(input, products)),
    values: Object.fromEntries(
      Array.from(formData.entries())
        .filter(
          ([key, value]) => key !== "products" && typeof value === "string",
        )
        .map(([key, value]) => [key, value as string]),
    ),
  };
}
