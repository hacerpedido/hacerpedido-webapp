import type { Product, Shop } from "../types";
import { validatePhoneNumber } from "../utils/utils";

export interface ShopEditorInput extends Omit<Partial<Shop>, "products"> {
  id: string | number;
  token: string;
  products?: Product[] | null;
}

export function validateShopEditorInput(input: unknown): string | null {
  if (!input || typeof input !== "object") return "Datos inválidos.";
  const value = input as ShopEditorInput;
  if (!value.token || typeof value.token !== "string") return "Token inválido.";
  if (
    value.id == null ||
    (typeof value.id !== "string" && typeof value.id !== "number") ||
    String(value.id).trim() === ""
  ) {
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
      if (
        product.shopid != null &&
        String(product.shopid) !== String(value.id)
      ) {
        return "Producto asociado a otro comercio.";
      }
    }
  }
  return null;
}
