import type { Product, Shop } from "../types";
import { validatePhoneNumber } from "../utils/utils";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export interface ShopEditorInput extends Omit<Partial<Shop>, "products"> {
  id: string;
  token: string;
  products?: Product[] | null;
}

export function validateShopEditorInput(input: unknown): string | null {
  if (!input || typeof input !== "object") return "Datos inválidos.";
  const value = input as ShopEditorInput;
  if (!value.token || typeof value.token !== "string") return "Token inválido.";
  if (!isUuid(value.id)) {
    return "Comercio inválido.";
  }
  if (typeof value.name !== "string" || value.name.trim() === "") {
    return "El nombre del comercio es requerido.";
  }

  const whatsapp = value.orderswhatsappnumber || "";
  const phone = value.ordersphonenumber || "";
  if (!whatsapp && !phone)
    return "Al menos un número de teléfono debe ser ingresado.";
  for (const number of [whatsapp, phone]) {
    if (number && typeof validatePhoneNumber(number) === "string") {
      return validatePhoneNumber(number) as string;
    }
  }

  if (value.products != null && !Array.isArray(value.products))
    return "Productos inválidos.";
  if (Array.isArray(value.products)) {
    for (const product of value.products) {
      if (
        !product ||
        typeof product !== "object" ||
        typeof product.name !== "string"
      ) {
        return "Productos inválidos.";
      }

      const productValue = product as Product & Record<string, unknown>;
      if (
        ("description" in productValue &&
          productValue.description !== null &&
          typeof productValue.description !== "string") ||
        ("price" in productValue &&
          productValue.price !== null &&
          typeof productValue.price !== "string") ||
        ("category" in productValue &&
          productValue.category !== null &&
          typeof productValue.category !== "string") ||
        ("itemnumber" in productValue &&
          productValue.itemnumber !== null &&
          (typeof productValue.itemnumber !== "number" ||
            !Number.isInteger(productValue.itemnumber)))
      ) {
        return "Productos inválidos.";
      }
      if ("id" in productValue && !isUuid(productValue.id)) {
        return "Productos inválidos.";
      }
      if ("shopid" in productValue && !isUuid(productValue.shopid)) {
        return "Productos inválidos.";
      }
      if (
        isUuid(productValue.shopid) &&
        productValue.shopid.toLowerCase() !== value.id.toLowerCase()
      ) {
        return "Producto asociado a otro comercio.";
      }
    }
  }
  return null;
}
