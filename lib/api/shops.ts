import type { Product, Shop } from "../types";
import { getApiErrorMessage, requestJson } from "./index";

export interface ShopPatch extends Partial<Shop> {
  id: string;
}

export interface SaveShopResult {
  message: string;
  error?: number;
}

export async function saveShopWithProducts(
  token: string,
  shopPatch: ShopPatch,
  newProducts: Product[],
  endpoint = "/api/shop/by-token",
): Promise<SaveShopResult> {
  const params = {
    id: shopPatch.id,
    address: shopPatch.address,
    deliverycost: shopPatch.deliverycost,
    name: shopPatch.name,
    notes: shopPatch.notes,
    opentimes: shopPatch.opentimes,
    ordersphonenumber: shopPatch.ordersphonenumber,
    orderswhatsappnumber: shopPatch.orderswhatsappnumber,
    token: token,
    products: newProducts,
  };

  // console.log("saveShopWithProducts 2:", params);

  try {
    const body =
      endpoint === "/api/shop/editor"
        ? { shop: { ...shopPatch, token }, products: newProducts }
        : params;
    await requestJson(`${window.location.origin}${endpoint}`, {
      method: "POST",
      body,
    });
  } catch (error: unknown) {
    const responseMessage = getApiErrorMessage(error);
    return {
      message: `Error al grabar los datos del comercio. (${String(error)} Error: ${responseMessage})`,
      error: 1,
    };
  }

  return {
    message: "Tus cambios fueron guardados.",
  };
}
