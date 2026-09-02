"use server";

import { products as productsTable, shops } from "#db/schema";

import { and, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import type { Product } from "../types";
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

/** Signals an authenticated editor that does not own the target shop. */
class EditorNotAuthorizedError extends Error {}

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

  interface EditorOutcome extends ShopEditorResult {
    slug?: string;
  }

  try {
    // Drizzle wraps the callback in BEGIN/COMMIT and rolls back on throw.
    const outcome = await getDb().transaction(
      async (tx): Promise<EditorOutcome> => {
        // Validation guarantees the string fields when present; like the old
        // parameter binding, absent fields are stored as NULL.
        const optionalText = (value: unknown): string | null =>
          typeof value === "string" ? value : null;

        const updated = await tx
          .update(shops)
          .set({
            address: optionalText(input.address),
            deliverycost: optionalText(input.deliverycost),
            name: typeof input.name === "string" ? input.name : "",
            notes: optionalText(input.notes),
            opentimes: optionalText(input.opentimes),
            ordersphonenumber: optionalText(input.ordersphonenumber),
            orderswhatsappnumber: optionalText(input.orderswhatsappnumber),
            updated_at: new Date(),
          })
          .where(
            and(eq(shops.id, input.id), eq(shops.typeformtoken, input.token)),
          )
          .returning({ slug: shops.slug });

        if (!updated.length) {
          throw new EditorNotAuthorizedError();
        }

        if (products !== null) {
          await tx
            .delete(productsTable)
            .where(eq(productsTable.shopid, input.id));
          if (products.length > 0) {
            await tx.insert(productsTable).values(
              products.map((product) => ({
                shopid: input.id,
                name: product.name,
                category: product.category ?? "",
                price: product.price ?? null,
                description: product.description ?? null,
                itemnumber: product.itemnumber ?? null,
              })),
            );
          }
        }

        return {
          message: "Tus cambios fueron guardados.",
          slug: updated[0].slug,
        };
      },
    );

    if (outcome.error) return outcome;
    revalidateShopPath(`/${outcome.slug}`);
    return { message: outcome.message };
  } catch (error) {
    if (error instanceof EditorNotAuthorizedError) {
      return { message: "No autorizado para editar este comercio.", error: 1 };
    }
    console.error(error);
    return { message: "Error al grabar los datos del comercio.", error: 1 };
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
